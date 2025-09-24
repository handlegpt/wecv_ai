'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Download, FileText, FileCode, FileJson, Loader2 } from 'lucide-react'

interface Template {
  id: string
  name: string
  category: string
}

export default function BuilderPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [resumeData, setResumeData] = useState({
    title: '',
    content: {
      personal: { name: '', email: '', phone: '', location: '' },
      summary: '',
      experience: [],
      education: [],
      skills: []
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingJson, setIsExportingJson] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    fetchTemplates()
  }, [router])

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/template`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
        if (data.length > 0) {
          setSelectedTemplate(data[0].id)
        }
      }
    } catch (error) {
      toast.error('获取模板失败')
    }
  }

  const handleSave = async () => {
    if (!resumeData.title.trim()) {
      toast.error('请输入简历标题')
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: resumeData.title,
          content: resumeData.content,
          templateId: selectedTemplate
        })
      })

      if (response.ok) {
        toast.success('简历保存成功！')
        router.push('/dashboard')
      } else {
        toast.error('保存失败')
      }
    } catch (error) {
      toast.error('网络错误')
    } finally {
      setIsLoading(false)
    }
  }

  // 新增导出功能
  const handleExport = async (format: 'pdf' | 'word' | 'html') => {
    setIsExporting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resume-export/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          format,
          data: resumeData,
          templateId: selectedTemplate
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${resumeData.title || 'resume'}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`${format.toUpperCase()} 导出成功！`)
      } else {
        toast.error('导出失败')
      }
    } catch (error) {
      toast.error('导出过程中出现错误')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJson = async () => {
    setIsExportingJson(true)
    try {
      const jsonData = {
        title: resumeData.title,
        content: resumeData.content,
        templateId: selectedTemplate,
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resumeData.title || 'resume'}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('JSON 导出成功！')
    } catch (error) {
      toast.error('JSON 导出失败')
    } finally {
      setIsExportingJson(false)
    }
  }

  const handleAIAssist = async (section: string, prompt: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('AI生成完成！')
        // 这里可以将AI生成的内容填入对应字段
        return data.result
      } else {
        toast.error('AI生成失败')
      }
    } catch (error) {
      toast.error('网络错误')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">WeCV AI - Resume Builder</h1>
            <div className="flex space-x-4">
              {/* 导出按钮组 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="btn-secondary flex items-center space-x-2"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleExport('word')}
                  disabled={isExporting}
                  className="btn-secondary flex items-center space-x-2"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>Word</span>
                </button>
                <button
                  onClick={() => handleExport('html')}
                  disabled={isExporting}
                  className="btn-secondary flex items-center space-x-2"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileCode className="w-4 h-4" />
                  )}
                  <span>HTML</span>
                </button>
                <button
                  onClick={handleExportJson}
                  disabled={isExportingJson}
                  className="btn-secondary flex items-center space-x-2"
                >
                  {isExportingJson ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileJson className="w-4 h-4" />
                  )}
                  <span>JSON</span>
                </button>
              </div>
              
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? '保存中...' : '保存简历'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">基本信息</h2>
              
              {/* Resume Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  简历标题
                </label>
                <input
                  type="text"
                  value={resumeData.title}
                  onChange={(e) => setResumeData({...resumeData, title: e.target.value})}
                  className="input-field"
                  placeholder="例如：软件工程师简历"
                />
              </div>

              {/* Template Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择模板
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="input-field"
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">个人信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                    <input
                      type="text"
                      value={resumeData.content.personal.name}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        content: {
                          ...resumeData.content,
                          personal: { ...resumeData.content.personal, name: e.target.value }
                        }
                      })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                    <input
                      type="email"
                      value={resumeData.content.personal.email}
                      onChange={(e) => setResumeData({
                        ...resumeData,
                        content: {
                          ...resumeData.content,
                          personal: { ...resumeData.content.personal, email: e.target.value }
                        }
                      })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">个人简介</label>
                  <button
                    onClick={() => handleAIAssist('summary', '请帮我写一段个人简介，突出我的专业技能和工作经验')}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    AI助手
                  </button>
                </div>
                <textarea
                  value={resumeData.content.summary}
                  onChange={(e) => setResumeData({
                    ...resumeData,
                    content: { ...resumeData.content, summary: e.target.value }
                  })}
                  rows={4}
                  className="input-field"
                  placeholder="请描述您的职业目标、专业技能和主要成就..."
                />
              </div>
            </div>
          </div>

          {/* Right Panel - AI Assistant */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-medium mb-4">AI 写作助手</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    工作经历描述
                  </label>
                  <textarea
                    rows={3}
                    className="input-field"
                    placeholder="描述您的工作职责和成就..."
                  />
                  <button
                    onClick={() => handleAIAssist('experience', '请帮我优化这段工作经历描述，使其更专业和突出成就')}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    AI优化
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    技能描述
                  </label>
                  <textarea
                    rows={3}
                    className="input-field"
                    placeholder="列出您的专业技能..."
                  />
                  <button
                    onClick={() => handleAIAssist('skills', '请帮我优化技能描述，使其更符合招聘要求')}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    AI优化
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 