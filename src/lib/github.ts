import type { Post } from '../types'

const CONFIG_KEY = 'cayole-notes.github-config.v1'
const API_VERSION = '2026-03-10'
const POSTS_PATH = 'public/posts.json'

export interface GitHubConfig {
  owner: string
  repo: string
  branch: string
}

interface GitHubContentResponse {
  sha?: string
  message?: string
}

interface GitHubUpdateResponse {
  commit?: {
    sha?: string
    html_url?: string
  }
  message?: string
}

export class GitHubPublishError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'GitHubPublishError'
    this.status = status
  }
}

function isSafeSegment(value: string) {
  return /^[A-Za-z0-9_.-]{1,100}$/.test(value)
}

function isSafeBranch(value: string) {
  return (
    /^[A-Za-z0-9._/-]{1,200}$/.test(value) &&
    !value.includes('..') &&
    !value.includes('//') &&
    !value.startsWith('/') &&
    !value.endsWith('/')
  )
}

export function validateGitHubConfig(config: GitHubConfig) {
  if (!isSafeSegment(config.owner)) return 'GitHub 用户名格式不正确。'
  if (!isSafeSegment(config.repo)) return '仓库名称格式不正确。'
  if (!isSafeBranch(config.branch)) return '分支名称格式不正确。'
  return null
}

export function loadGitHubConfig(): GitHubConfig {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? '{}') as Partial<GitHubConfig>
    const config = {
      owner: typeof saved.owner === 'string' ? saved.owner : '',
      repo: typeof saved.repo === 'string' ? saved.repo : '',
      branch: typeof saved.branch === 'string' ? saved.branch : 'main',
    }
    return validateGitHubConfig(config) ? { owner: '', repo: '', branch: 'main' } : config
  } catch {
    return { owner: '', repo: '', branch: 'main' }
  }
}

export function saveGitHubConfig(config: GitHubConfig) {
  const error = validateGitHubConfig(config)
  if (error) throw new GitHubPublishError(error)
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

function encodeUtf8Base64(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  const chunkSize = 0x8000

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return btoa(binary)
}

async function readError(response: Response) {
  try {
    const body = await response.json() as GitHubContentResponse
    return body.message || `GitHub 返回 ${response.status}`
  } catch {
    return `GitHub 返回 ${response.status}`
  }
}

function apiUrl(config: GitHubConfig) {
  const owner = encodeURIComponent(config.owner)
  const repo = encodeURIComponent(config.repo)
  const path = POSTS_PATH.split('/').map(encodeURIComponent).join('/')
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
}

export async function publishPostsToGitHub(options: {
  config: GitHubConfig
  token: string
  posts: Post[]
  title: string
}) {
  const { config, posts, title } = options
  const token = options.token.trim()
  const configError = validateGitHubConfig(config)
  if (configError) throw new GitHubPublishError(configError)
  if (token.length < 20) throw new GitHubPublishError('请输入有效的 fine-grained token。')

  const url = apiUrl(config)
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': API_VERSION,
  }

  const currentResponse = await fetch(`${url}?ref=${encodeURIComponent(config.branch)}`, {
    headers,
    cache: 'no-store',
    redirect: 'error',
  })

  let sha: string | undefined
  if (currentResponse.ok) {
    const current = await currentResponse.json() as GitHubContentResponse
    sha = typeof current.sha === 'string' ? current.sha : undefined
  } else if (currentResponse.status !== 404) {
    throw new GitHubPublishError(await readError(currentResponse), currentResponse.status)
  }

  const content = `${JSON.stringify(posts, null, 2)}\n`
  const updateResponse = await fetch(url, {
    method: 'PUT',
    headers,
    redirect: 'error',
    body: JSON.stringify({
      message: `publish: ${title}`,
      content: encodeUtf8Base64(content),
      branch: config.branch,
      ...(sha ? { sha } : {}),
    }),
  })

  if (!updateResponse.ok) {
    const message = await readError(updateResponse)
    if (updateResponse.status === 409) {
      throw new GitHubPublishError('仓库文件刚刚被修改，请重新发布以获取最新版本。', 409)
    }
    throw new GitHubPublishError(message, updateResponse.status)
  }

  const result = await updateResponse.json() as GitHubUpdateResponse
  const commitSha = result.commit?.sha
  const commitUrl = result.commit?.html_url ?? (
    commitSha ? `https://github.com/${config.owner}/${config.repo}/commit/${commitSha}` : undefined
  )

  return { commitSha, commitUrl }
}

export const githubPostsPath = POSTS_PATH
