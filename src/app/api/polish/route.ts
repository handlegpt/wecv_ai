import { NextResponse } from "next/server";
import { AIModelType } from "@/store/useAIConfigStore";
import { AI_MODEL_CONFIGS } from "@/config/ai";

// 请求大小限制 (1MB)
const MAX_REQUEST_SIZE = 1024 * 1024;

// 内容长度限制 (50KB)
const MAX_CONTENT_LENGTH = 50 * 1024;

// API 密钥格式验证
function isValidApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') return false;
  return /^[a-zA-Z0-9_-]{20,200}$/.test(apiKey);
}

// 内容长度验证
function isValidContent(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  return content.length <= MAX_CONTENT_LENGTH && content.length > 0;
}

// API 端点验证
function isValidApiEndpoint(endpoint: string): boolean {
  if (!endpoint || typeof endpoint !== 'string') return false;
  try {
    const url = new URL(endpoint);
    return url.protocol === 'https:' && url.hostname.includes('openai.com');
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // 检查请求大小
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        { error: "请求过大" },
        { status: 413 }
      );
    }

    const body = await req.json();
    const { apiKey, model, content, modelType, apiEndpoint } = body;

    // 输入验证
    if (!apiKey || !isValidApiKey(apiKey)) {
      return NextResponse.json(
        { error: "无效的 API 密钥" },
        { status: 400 }
      );
    }

    if (!content || !isValidContent(content)) {
      return NextResponse.json(
        { error: "内容长度无效" },
        { status: 400 }
      );
    }

    if (!modelType || !["doubao", "deepseek", "openai"].includes(modelType)) {
      return NextResponse.json(
        { error: "无效的模型类型" },
        { status: 400 }
      );
    }

    // 验证 API 端点（仅对 OpenAI 类型）
    if (modelType === 'openai' && (!apiEndpoint || !isValidApiEndpoint(apiEndpoint))) {
      return NextResponse.json(
        { error: "无效的 API 端点" },
        { status: 400 }
      );
    }

    const modelConfig = AI_MODEL_CONFIGS[modelType as AIModelType];
    if (!modelConfig) {
      return NextResponse.json(
        { error: "不支持的模型类型" },
        { status: 400 }
      );
    }

    const response = await fetch(modelConfig.url(apiEndpoint), {
      method: "POST",
      headers: modelConfig.headers(apiKey),
      body: JSON.stringify({
        model: modelConfig.requiresModelId ? model : modelConfig.defaultModel,
        messages: [
          {
            role: "system",
            content: `你是一个专业的简历优化助手。请帮助优化以下文本，使其更加专业和有吸引力。
              
              优化原则：
              1. 使用更专业的词汇和表达方式
              2. 突出关键成就和技能
              3. 保持简洁清晰
              4. 使用主动语气
              5. 保持原有信息的完整性
              6. 保留我输入的格式
              
              请直接返回优化后的文本，不要包含任何解释或其他内容。`,
          },
          {
            role: "user",
            content,
          },
        ],
        stream: true,
      }),
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk
              .split("\n")
              .filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.includes("[DONE]")) continue;
              if (!line.startsWith("data:")) continue;

              try {
                const data = JSON.parse(line.slice(5));
                const content = data.choices[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                // JSON 解析错误，跳过此数据块
              }
            }
          }
        } catch (error) {
          // 流读取错误，关闭控制器
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "内容优化服务暂时不可用" },
      { status: 500 }
    );
  }
}
