/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

// GitHub Spark API Types
interface SparkLLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface SparkAPI {
  llm: (
    messages: SparkLLMMessage[],
    model?: string,
    stream?: boolean
  ) => Promise<string>;
  llmPrompt: (
    messages: string[],
    options?: Record<string, unknown>
  ) => SparkLLMMessage[];
  kv: {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
}

interface Window {
  spark: SparkAPI;
}

// YouTube API Response Types
interface YouTubeSearchItem {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
  };
}

interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  items: YouTubeSearchItem[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

interface YouTubeVideoStatistics {
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

interface YouTubeVideoItem {
  kind: string;
  etag: string;
  id: string;
  statistics: YouTubeVideoStatistics;
}

interface YouTubeVideosResponse {
  kind: string;
  etag: string;
  items: YouTubeVideoItem[];
}

// GitHub API Response Types
interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

interface GitHubCommitResponse {
  content: {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
  };
  commit: {
    sha: string;
    url: string;
  };
}