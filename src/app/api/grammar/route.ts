import { NextRequest, NextResponse } from "next/server";
import { AIModelType } from "@/store/useAIConfigStore";
import { AI_MODEL_CONFIGS } from "@/config/ai";

// 请求大小限制 (1MB)
const MAX_REQUEST_SIZE = 1024 * 1024;

// 内容长度限制 (10KB)
const MAX_CONTENT_LENGTH = 10 * 1024;

// API 密钥格式验证
function isValidApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') return false;
  // 基本格式检查：至少包含字母和数字，长度在 20-200 之间
  return /^[a-zA-Z0-9_-]{20,200}$/.test(apiKey);
}

// 内容长度验证
function isValidContent(content: string): boolean {
  if (!content || typeof content !== 'string') return false;
  return content.length <= MAX_CONTENT_LENGTH && content.length > 0;
}

export async function POST(req: NextRequest) {
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
    const { apiKey, model, content, modelType } = body;

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

    const modelConfig = AI_MODEL_CONFIGS[modelType as AIModelType];
    if (!modelConfig) {
      return NextResponse.json(
        { error: "不支持的模型类型" },
        { status: 400 }
      );
    }

    const response = await fetch(modelConfig.url(""), {
      method: "POST",
      headers: modelConfig.headers(apiKey),

      body: JSON.stringify({
        model: modelConfig.requiresModelId ? model : modelConfig.defaultModel,
        response_format: {
          type: "json_object"
        },
        messages: [
          {
            role: "system",
            content: `你是一个专业的中文简历错别字检查助手。请完整检查以下文本，不要遗漏，以下是要求：
              1.所有考虑中文语境下的语法组词错误，包括拼写错误，语境用词错误，专业术语错误。
              2.验证是否有遗漏文字未检查
              3.对每个发现的问题，请按JSON格式返回

              以下是示例格式：
              {
                "errors": [
                  {
                    "text": "错误的文本",
                    "message": "详细的错误说明",
                    "type": "spelling"或"grammar",
                    "suggestions": ["建议修改1", "建议修改2"]
                  }
                ]
              }

              请确保返回的格式可以正常解析`
          },
          {
            role: "user",
            content: content
          }
        ]
      })
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "语法检查服务暂时不可用" },
        { status: 502 }
      );
    }

    const data = await response.json();
    
    // 添加安全响应头
    const responseHeaders = new Headers();
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('X-Frame-Options', 'DENY');
    responseHeaders.set('X-XSS-Protection', '1; mode=block');
    
    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error) {
    // 不记录敏感错误信息
    return NextResponse.json(
      { error: "语法检查服务暂时不可用" },
      { status: 500 }
    );
  }
}
