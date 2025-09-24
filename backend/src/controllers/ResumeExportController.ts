import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class ResumeExportController {
  async exportResume(resumeId: string, userId: string, format: string, data?: any) {
    let resume;
    
    // 如果提供了data参数，直接使用；否则从数据库查找
    if (data) {
      resume = {
        id: resumeId,
        title: data.title || 'Resume',
        content: data,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        experiences: data.experience || [],
        education: data.education || [],
        skills: data.skills || [],
        projects: data.projects || []
      };
    } else {
      resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
        include: {
          experiences: true,
          education: true,
          skills: true,
          projects: true,
        },
      });

      if (!resume) {
        throw new Error('Resume not found');
      }
    }

    switch (format) {
      case 'pdf':
        return await this.exportToPDF(resume, data);
      case 'docx':
        return await this.exportToDOCX(resume, data);
      case 'html':
        return await this.exportToHTML(resume, data);
      case 'json':
        return await this.exportToJSON(resume);
      default:
        throw new Error('Unsupported format');
    }
  }

  async generateShareLink(resumeId: string, userId: string, expiresIn: number = 24) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    const shareToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000);

    await prisma.resumeShare.create({
      data: {
        resumeId,
        shareToken,
        expiresAt,
        createdBy: userId,
      },
    });

    return `${process.env.FRONTEND_URL}/resume/shared/${shareToken}`;
  }

  async getSharedResume(shareToken: string) {
    const share = await prisma.resumeShare.findFirst({
      where: {
        shareToken,
        expiresAt: { gt: new Date() },
      },
      include: {
        resume: {
          include: {
            experiences: true,
            education: true,
            skills: true,
            projects: true,
          },
        },
      },
    });

    if (!share) {
      throw new Error('Share link not found or expired');
    }

    return share.resume;
  }

  async getExportHistory(resumeId: string, userId: string) {
    const exports = await prisma.resumeExport.findMany({
      where: {
        resumeId,
        createdBy: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return exports;
  }

  getContentType(format: string): string {
    switch (format) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'html':
        return 'text/html';
      case 'json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }

  private async exportToPDF(resume: any, data: any): Promise<Buffer> {
    const html = this.generateHTML(resume, data);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setContent(html);
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });
    
    await browser.close();
    
    await this.logExport(resume.id, 'pdf', resume.userId);
    
    return pdf;
  }

  private async exportToDOCX(resume: any, data: any): Promise<Buffer> {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: resume.name || 'Resume',
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: resume.email || '',
                size: 24,
              }),
            ],
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    await this.logExport(resume.id, 'docx', resume.userId);
    
    return buffer;
  }

  private exportToHTML(resume: any, data: any): Buffer {
    const html = this.generateHTML(resume, data);
    this.logExport(resume.id, 'html', resume.userId);
    return Buffer.from(html, 'utf-8');
  }

  private exportToJSON(resume: any): Buffer {
    const jsonData = JSON.stringify(resume, null, 2);
    this.logExport(resume.id, 'json', resume.userId);
    return Buffer.from(jsonData, 'utf-8');
  }

  private generateHTML(resume: any, data: any): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${resume.name || 'Resume'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .contact {
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            border-bottom: 2px solid #333;
            margin-bottom: 15px;
            padding-bottom: 5px;
          }
          .experience-item, .education-item {
            margin-bottom: 15px;
          }
          .job-title {
            font-weight: bold;
            font-size: 16px;
          }
          .company {
            font-style: italic;
            color: #666;
          }
          .date {
            color: #666;
            font-size: 14px;
          }
          .description {
            margin-top: 5px;
            text-align: justify;
          }
          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .skill {
            background: #f0f0f0;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${resume.name || 'Your Name'}</div>
          <div class="contact">
            ${resume.email ? `${resume.email} • ` : ''}
            ${resume.phone || ''}
          </div>
        </div>

        ${resume.summary ? `
        <div class="section">
          <div class="section-title">Summary</div>
          <div class="description">${resume.summary}</div>
        </div>
        ` : ''}

        ${resume.experiences && resume.experiences.length > 0 ? `
        <div class="section">
          <div class="section-title">Experience</div>
          ${resume.experiences.map((exp: any) => `
            <div class="experience-item">
              <div class="job-title">${exp.title}</div>
              <div class="company">${exp.company}</div>
              <div class="date">${exp.startDate} - ${exp.endDate || 'Present'}</div>
              <div class="description">${exp.description || ''}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${resume.education && resume.education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${resume.education.map((edu: any) => `
            <div class="education-item">
              <div class="job-title">${edu.degree}</div>
              <div class="company">${edu.institution}</div>
              <div class="date">${edu.startDate} - ${edu.endDate || 'Present'}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${resume.skills && resume.skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills">
            ${resume.skills.map((skill: any) => `
              <span class="skill">${skill.name}</span>
            `).join('')}
          </div>
        </div>
        ` : ''}

        ${resume.projects && resume.projects.length > 0 ? `
        <div class="section">
          <div class="section-title">Projects</div>
          ${resume.projects.map((project: any) => `
            <div class="experience-item">
              <div class="job-title">${project.title}</div>
              <div class="description">${project.description || ''}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}
      </body>
      </html>
    `;
  }

  private async logExport(resumeId: string, format: string, userId: string) {
    try {
      await prisma.resumeExport.create({
        data: {
          resumeId,
          format,
          createdBy: userId,
        },
      });
    } catch (error) {
      // 导出日志记录失败
    }
  }
} 