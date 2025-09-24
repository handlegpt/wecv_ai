import { useTranslations } from "next-intl";

export default function TermsPage() {
  const t = useTranslations("home");

  return (
    <div className="py-20">
      <div className="mx-auto max-w-[800px] px-4">
        <h1 className="text-4xl font-bold mb-8">使用条款</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            最后更新日期：2024年4月1日
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. 服务说明</h2>
          <p>
            We CV 是一个免费的在线简历创建和编辑工具。我们提供以下服务：
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>简历创建和编辑</li>
            <li>多种专业模板</li>
            <li>AI 智能纠错</li>
            <li>本地数据存储</li>
            <li>数据导出功能</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. 使用条款</h2>
          <p>
            使用 We CV 即表示您同意以下条款：
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>您必须遵守所有适用的法律法规</li>
            <li>您不得使用本服务进行任何非法活动</li>
            <li>您不得尝试破坏或干扰本服务的正常运行</li>
            <li>您不得未经授权访问或使用他人的数据</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. 免责声明</h2>
          <p>
            We CV 按&ldquo;现状&rdquo;提供服务，不提供任何明示或暗示的保证。我们不对以下情况负责：
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>服务中断或数据丢失</li>
            <li>使用本服务造成的任何直接或间接损失</li>
            <li>第三方服务的问题或中断</li>
            <li>用户数据的准确性或完整性</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. 知识产权</h2>
          <p>
            We CV 的所有内容，包括但不限于文本、图形、标志、按钮图标、图像、音频片段、数字下载、数据编辑和软件，均为 We CV 或其内容提供商的财产，受著作权法和国际著作权条约以及其他知识产权法律法规的保护。
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. 修改条款</h2>
          <p>
            我们保留随时修改这些条款的权利。修改后的条款将在网站上发布时立即生效。继续使用我们的服务即表示您接受修改后的条款。
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. 联系我们</h2>
          <p>
            如果您对这些使用条款有任何疑问，请通过以下方式联系我们：
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>邮箱：handlegpt@gmail.com</li>
            <li>GitHub：https://github.com/handlegpt/wecv</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 