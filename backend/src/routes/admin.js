const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { requireAdmin, requireSuperadmin } = require('../middleware/roles');
const prisma = new PrismaClient();

router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        websites: true,
        subscription: true,
      },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        websites: true,
        subscription: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/users/:id/role', authMiddleware, requireSuperadmin, async (req, res) => {
  try {
    const role = (req.body.role || '').toString().toUpperCase();
    const allowedRoles = ['USER', 'ADMIN', 'SUPERADMIN'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });

    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/users/:id/subscription', authMiddleware, requireAdmin, async (req, res) => {
  const { plan, status } = req.body;
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { subscription: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    let subscription;
    if (user.subscription) {
      subscription = await prisma.subscription.update({
        where: { userId: id },
        data: { plan, status }
      });
    } else {
      subscription = await prisma.subscription.create({
        data: {
          userId: id,
          plan,
          status
        }
      });
    }

    res.json(subscription);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/websites', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const websites = await prisma.website.findMany({
      include: {
        user: true,
        keywords: true,
      },
    });
    res.json(websites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/blogs', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: blogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/blogs', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      slug: providedSlug,
      excerpt,
      content,
      author,
      category,
      featured = false,
      imageUrl,
      readTime = 5,
      published = true,
    } = req.body;

    if (!title || !excerpt || !content || !author || !category) {
      return res.status(400).json({ error: 'Missing required blog fields' });
    }

    const slug = providedSlug
      ? providedSlug.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : title.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const existingBlog = await prisma.blog.findUnique({ where: { slug } });
    if (existingBlog) {
      return res.status(409).json({ error: 'Blog slug already exists' });
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        author,
        category,
        featured,
        imageUrl,
        readTime: Number(readTime),
        published,
      },
    });

    res.status(201).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/blogs/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.slug) {
      updateData.slug = updateData.slug.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const existingBlog = await prisma.blog.findUnique({ where: { slug: updateData.slug } });
      if (existingBlog && existingBlog.id !== id) {
        return res.status(409).json({ error: 'Blog slug already exists' });
      }
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: updateData,
    });

    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/blogs/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.blog.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
