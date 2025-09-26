import { DEFAULT_FIELD_ORDER } from ".";
import { GlobalSettings, DEFAULT_CONFIG, ResumeData } from "../types/resume";

// 根据语言环境获取初始简历数据
export const getInitialResumeState = (locale: string = 'zh') => {
  switch (locale) {
    case 'en':
      return initialResumeStateEn;
    case 'ja':
      return initialResumeStateJa;
    default:
      return initialResumeState;
  }
};
const initialGlobalSettings: GlobalSettings = {
  baseFontSize: 16,
  pagePadding: 32,
  paragraphSpacing: 16,
  lineHeight: 1.6,
  sectionSpacing: 24,
  headerSize: 18,
  subheaderSize: 16,
  useIconMode: true,
  themeColor: "#000000",
  centerSubtitle: true,
};

export const initialResumeState = {
  title: "新建简历",
  basic: {
    name: "WeCV",
    title: "最前线工程师",
    employementStatus: "在职",
    email: "hello # wecv.com",
    phone: "88880000",
    location: "东京",
    birthDate: "2000-12",
    fieldOrder: DEFAULT_FIELD_ORDER,
    icons: {
      email: "Mail",
      phone: "Phone",
      birthDate: "CalendarRange",
      employementStatus: "Briefcase",
      location: "MapPin",
    },
    photoConfig: DEFAULT_CONFIG,
    customFields: [
      {
        id: "personal",
        label: "网站",
        value: "https://wecv.com",
        icon: "Globe",
      },
    ],
    photo: "/avatar.png",
  },
  education: [
    {
      id: "1",
      school: "社会大学",
      major: "AI科技",
      degree: "硕士",
      startDate: "2020-02",
      endDate: "2023-07",
      visible: true,
      gpa: "",
      description: `<ul class="custom-list">
        <li>主修课程：机器学习、深度学习、自然语言处理、计算机视觉、AI伦理</li>
        <li>专业排名前 3%，连续三年获得特等奖学金</li>
        <li>担任AI创新实验室负责人，组织多次AI技术研讨会</li>
        <li>参与多个AI开源项目，获得 Kaggle Expert 认证</li>
      </ul>`,
    },
  ],
  skillContent: `<div class="skill-content">
  <ul class="custom-list">
    <li>AI框架：精通 TensorFlow、PyTorch，熟练使用 Transformers、LangChain 等 AI 开发框架</li>
    <li>编程语言：Python、R、Julia、C++、CUDA</li>
    <li>数据科学：Pandas、NumPy、Scikit-learn、Matplotlib、Seaborn</li>
    <li>机器学习：监督学习、无监督学习、强化学习、深度学习、迁移学习</li>
    <li>AI工具：Jupyter、Colab、MLflow、Weights & Biases、Hugging Face</li>
    <li>模型部署：Docker、Kubernetes、TensorFlow Serving、ONNX、MLOps</li>
    <li>算法优化：模型压缩、量化、剪枝、知识蒸馏、联邦学习</li>
    <li>版本控制：Git、DVC、MLflow Model Registry</li>
    <li>技术领导：AI团队管理经验，主导多个AI产品的技术架构和算法设计</li>
  </ul>
</div>`,
  experience: [
    {
      id: "1",
      company: "谷歌",
      position: "高级经理",
      date: "2023/5 - 至今",
      visible: true,
      details: `<ul class="custom-list">
      <li>领导15+工程师的跨职能团队，负责谷歌创作者平台的开发与维护，统筹技术战略和产品路线图</li>
      <li>实施敏捷开发流程和CI/CD流水线，部署时间减少75%，团队生产力提升40%</li>
      <li>建立工程标准和组件库架构，在多个产品线中实现80%的代码复用率</li>
      <li>指导大规模性能优化项目，平台加载时间提升60%，显著改善用户体验</li>
      <li>建设和管理高效工程团队，进行绩效评估，制定团队成员职业发展规划</li>
    </ul>`,
    },
  ],
  draggingProjectId: null,
  projects: [
    {
      id: "p1",
      name: "WeCV AI",
      role: "工程师",
      date: "2024/6 - 2025/3",
      description: `<ul class="custom-list">
        <li>基于 AI 驱动的简历创建和管理平台，服务数以千计的求职者</li>
        <li>包含智能内容生成、模板管理、多格式导出等多个子系统</li>
        <li>使用 Redux 进行状态管理，实现复杂简历数据流的高效处理</li>
        <li>采用 Ant Design 组件库，确保界面设计的一致性和用户体验</li>
        <li>实施代码分割和懒加载策略，优化大规模应用的加载性能</li>
      </ul>`,
      visible: true,
    },
  ],
  menuSections: [
    { id: "basic", title: "基本信息", icon: "👤", enabled: true, order: 0 },
    { id: "skills", title: "专业技能", icon: "⚡", enabled: true, order: 1 },
    {
      id: "experience",
      title: "工作经验",
      icon: "💼",
      enabled: true,
      order: 2,
    },

    {
      id: "projects",
      title: "项目经历",
      icon: "🚀",
      enabled: true,
      order: 3,
    },
    {
      id: "education",
      title: "教育经历",
      icon: "🎓",
      enabled: true,
      order: 4,
    },
  ],
  customData: {},
  activeSection: "basic",
  globalSettings: initialGlobalSettings,
};

export const initialResumeStateEn = {
  title: "New Resume",
  basic: {
    name: "Wecv AI",
    title: "Senior Manager",
    employementStatus: "Available",
    email: "Hello@wecv.com",
    phone: "8888123450",
    location: "New York",
    birthDate: "",
    fieldOrder: DEFAULT_FIELD_ORDER,
    icons: {
      email: "Mail",
      phone: "Phone",
      birthDate: "CalendarRange",
      employementStatus: "Briefcase",
      location: "MapPin",
    },
    photoConfig: DEFAULT_CONFIG,
    customFields: [],
    photo: "/avatar.png",
  },
  education: [
    {
      id: "1",
      school: "Social University",
      major: "AI Technology",
      degree: "Master's",
      startDate: "2020-02",
      endDate: "2023-07",
      visible: true,
      gpa: "",
      description: `<ul class="custom-list">
        <li>Core courses: Machine Learning, Deep Learning, Natural Language Processing, Computer Vision, AI Ethics</li>
        <li>Top 3% of class, received President's List honors for three consecutive years</li>
        <li>Served as Director of AI Innovation Lab, organized multiple AI technology seminars</li>
        <li>Contributed to multiple AI open-source projects, earned Kaggle Expert certification</li>
      </ul>`,
    },
  ],
  skillContent: `<div class="skill-content">
  <ul class="custom-list">
    <li>AI Frameworks: Proficient in TensorFlow, PyTorch, experienced with Transformers, LangChain and other AI development frameworks</li>
    <li>Programming Languages: Python, R, Julia, C++, CUDA</li>
    <li>Data Science: Pandas, NumPy, Scikit-learn, Matplotlib, Seaborn</li>
    <li>Machine Learning: Supervised Learning, Unsupervised Learning, Reinforcement Learning, Deep Learning, Transfer Learning</li>
    <li>AI Tools: Jupyter, Colab, MLflow, Weights & Biases, Hugging Face</li>
    <li>Model Deployment: Docker, Kubernetes, TensorFlow Serving, ONNX, MLOps</li>
    <li>Algorithm Optimization: Model Compression, Quantization, Pruning, Knowledge Distillation, Federated Learning</li>
    <li>Version Control: Git, DVC, MLflow Model Registry</li>
    <li>Technical Leadership: AI team management experience, led technical architecture and algorithm design for multiple AI products</li>
  </ul>
</div>`,
  experience: [
    {
      id: "1",
      company: "Google",
      position: "Senior Manager",
      date: "2023/5 - Present",
      visible: true,
      details: `<ul class="custom-list">
      <li>Led cross-functional teams of 15+ engineers in developing and maintaining Google's Creator Platform, overseeing technical strategy and product roadmap</li>
      <li>Implemented agile development processes and CI/CD pipelines, reducing deployment time by 75% and improving team productivity by 40%</li>
      <li>Established engineering standards and component library architecture, achieving 80% code reuse across multiple product lines</li>
      <li>Directed large-scale performance optimization initiatives, resulting in 60% improvement in platform loading times and enhanced user experience</li>
      <li>Built and managed high-performing engineering teams, conducted performance reviews, and developed career growth plans for team members</li>
    </ul>`,
    },
  ],
  draggingProjectId: null,
  projects: [
    {
      id: "p1",
      name: "WeCV AI",
      role: "Engineer",
      date: "2024/6 - 2025/3",
      description: `<ul class="custom-list">
        <li>AI-powered resume creation and management platform serving thousands of job seekers</li>
        <li>Includes intelligent content generation, template management, and multi-format export subsystems</li>
        <li>Implemented Redux for state management, enabling efficient handling of complex resume data flows</li>
        <li>Used Ant Design component library to ensure UI consistency and user experience</li>
        <li>Implemented code splitting and lazy loading strategies to optimize loading performance</li>
      </ul>`,
      visible: true,
    },
  ],
  menuSections: [
    {
      id: "basic",
      title: "Profile",
      icon: "👤",
      enabled: true,
      order: 0,
    },
    {
      id: "skills",
      title: "Skills",
      icon: "⚡",
      enabled: true,
      order: 1,
    },
    {
      id: "experience",
      title: "Experience",
      icon: "💼",
      enabled: true,
      order: 2,
    },
    {
      id: "projects",
      title: "Projects",
      icon: "🚀",
      enabled: true,
      order: 3,
    },
    {
      id: "education",
      title: "Education",
      icon: "🎓",
      enabled: true,
      order: 4,
    },
  ],
  customData: {},
  activeSection: "basic",
  globalSettings: initialGlobalSettings,
};


// 日文版初始简历数据
export const initialResumeStateJa = {
  title: "新しい履歴書",
  basic: {
    name: "WeCV",
    title: "最前線エンジニア",
    employementStatus: "在職中",
    email: "hello # wecv.com",
    phone: "88880000",
    location: "東京",
    birthDate: "2000-12",
    fieldOrder: DEFAULT_FIELD_ORDER,
    icons: {
      email: "Mail",
      phone: "Phone",
      birthDate: "CalendarRange",
      employementStatus: "Briefcase",
      location: "MapPin",
    },
    photoConfig: DEFAULT_CONFIG,
    customFields: [
      {
        id: "personal",
        label: "ウェブサイト",
        value: "https://wecv.com",
        icon: "Globe",
      },
    ],
    photo: "/avatar.png",
  },
  education: [
    {
      id: "1",
      school: "社会大学",
      major: "AIテクノロジー",
      degree: "修士",
      startDate: "2020-02",
      endDate: "2023-07",
      visible: true,
      gpa: "",
      description: `<ul class="custom-list">
        <li>主要科目：機械学習、深層学習、自然言語処理、コンピュータビジョン、AI倫理</li>
        <li>クラス上位3%、3年連続で特等奨学金を受賞</li>
        <li>AIイノベーションラボの責任者として、複数のAI技術セミナーを主催</li>
        <li>複数のAIオープンソースプロジェクトに貢献、Kaggle Expert認定を取得</li>
      </ul>`,
    },
  ],
  skillContent: `<div class="skill-content">
  <ul class="custom-list">
    <li>AIフレームワーク：TensorFlow、PyTorchに精通、Transformers、LangChainなどのAI開発フレームワークに習熟</li>
    <li>プログラミング言語：Python、R、Julia、C++、CUDA</li>
    <li>データサイエンス：Pandas、NumPy、Scikit-learn、Matplotlib、Seaborn</li>
    <li>機械学習：教師あり学習、教師なし学習、強化学習、深層学習、転移学習</li>
    <li>AIツール：Jupyter、Colab、MLflow、Weights & Biases、Hugging Face</li>
    <li>モデルデプロイ：Docker、Kubernetes、TensorFlow Serving、ONNX、MLOps</li>
    <li>アルゴリズム最適化：モデル圧縮、量子化、プルーニング、知識蒸留、連合学習</li>
    <li>バージョン管理：Git、DVC、MLflow Model Registry</li>
    <li>技術リーダーシップ：AIチーム管理経験、複数のAI製品の技術アーキテクチャとアルゴリズム設計を主導</li>
  </ul>
</div>`,
  experience: [
    {
      id: "1",
      company: "グーグル",
      position: "シニアマネージャー",
      date: "2023/5 - 現在",
      visible: true,
      details: `<ul class="custom-list">
      <li>グーグルのクリエイタープラットフォームの開発・保守において15名以上のエンジニアのクロスファンクショナルチームを率い、技術戦略とプロダクトロードマップを統括</li>
      <li>アジャイル開発プロセスとCI/CDパイプラインを実装し、デプロイ時間を75%短縮、チーム生産性を40%向上</li>
      <li>エンジニアリング標準とコンポーネントライブラリアーキテクチャを確立し、複数のプロダクトラインで80%のコード再利用率を達成</li>
      <li>大規模なパフォーマンス最適化プロジェクトを指揮し、プラットフォームの読み込み時間を60%改善し、ユーザーエクスペリエンスを向上</li>
      <li>高性能エンジニアリングチームを構築・管理し、パフォーマンスレビューを実施し、チームメンバーのキャリア成長計画を策定</li>
    </ul>`,
    },
  ],
  draggingProjectId: null,
  projects: [
    {
      id: "p1",
      name: "WeCV AI",
      role: "エンジニア",
      date: "2024/6 - 2025/3",
      description: `<ul class="custom-list">
        <li>数千人の求職者にサービスを提供するAI駆動の履歴書作成・管理プラットフォーム</li>
        <li>インテリジェントなコンテンツ生成、テンプレート管理、マルチフォーマットエクスポートなどのサブシステムを含む</li>
        <li>複雑な履歴書データフローの効率的な処理を可能にするReduxによる状態管理を実装</li>
        <li>UIの一貫性とユーザーエクスペリエンスを確保するためAnt Designコンポーネントライブラリを使用</li>
        <li>大規模アプリケーションの読み込みパフォーマンスを最適化するコード分割と遅延読み込み戦略を実装</li>
      </ul>`,
      visible: true,
    },
  ],
  menuSections: [
    {
      id: "basic",
      title: "プロフィール",
      icon: "👤",
      enabled: true,
      order: 0,
    },
    {
      id: "skills",
      title: "スキル",
      icon: "⚡",
      enabled: true,
      order: 1,
    },
    {
      id: "experience",
      title: "経験",
      icon: "💼",
      enabled: true,
      order: 2,
    },
    {
      id: "education",
      title: "教育",
      icon: "🎓",
      enabled: true,
      order: 3,
    },
    {
      id: "projects",
      title: "プロジェクト",
      icon: "🚀",
      enabled: true,
      order: 4,
    },
  ],
  customData: {},
  activeSection: "basic",
  globalSettings: initialGlobalSettings,
};
