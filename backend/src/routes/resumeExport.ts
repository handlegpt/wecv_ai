import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { ResumeExportController } from '../controllers/ResumeExportController';

const router = Router();
const exportController = new ResumeExportController();

// Export resume directly from data (for builder page)
router.post('/export', authenticateToken, async (req, res) => {
  try {
    const { format, data, templateId } = req.body;
    const userId = req.user.id;

    // Create a temporary resume object for export
    const tempResume = {
      id: 'temp-' + Date.now(),
      title: data.title || 'Resume',
      content: data,
      templateId: templateId,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const exportedFile = await exportController.exportResume(tempResume.id, userId, format, data);
    
    res.setHeader('Content-Type', exportController.getContentType(format));
    res.setHeader('Content-Disposition', `attachment; filename="${tempResume.title}.${format}"`);
    res.send(exportedFile);
  } catch (error) {
    // 导出失败
    res.status(500).json({ error: 'Failed to export resume' });
  }
});

// Export resume in various formats (with resumeId)
router.post('/:resumeId/export', authenticateToken, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { format, data } = req.body;
    const userId = req.user.id;

    const exportedFile = await exportController.exportResume(resumeId, userId, format, data);
    
    res.setHeader('Content-Type', exportController.getContentType(format));
    res.setHeader('Content-Disposition', `attachment; filename=resume-${resumeId}.${format}`);
    res.send(exportedFile);
  } catch (error) {
    // 导出失败
    res.status(500).json({ error: 'Failed to export resume' });
  }
});

// Generate shareable link
router.post('/:resumeId/share', authenticateToken, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;
    const { expiresIn } = req.body; // in hours

    const shareLink = await exportController.generateShareLink(resumeId, userId, expiresIn);
    res.json({ shareLink });
  } catch (error) {
    // 分享链接生成失败
    res.status(500).json({ error: 'Failed to generate share link' });
  }
});

// Get shared resume (public access)
router.get('/shared/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;
    
    const resume = await exportController.getSharedResume(shareToken);
    res.json(resume);
  } catch (error) {
    // 获取分享简历失败
    res.status(404).json({ error: 'Shared resume not found or expired' });
  }
});

// Get export history
router.get('/:resumeId/exports', authenticateToken, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;

    const exports = await exportController.getExportHistory(resumeId, userId);
    res.json(exports);
  } catch (error) {
    // 获取导出历史失败
    res.status(500).json({ error: 'Failed to get export history' });
  }
});

export default router; 