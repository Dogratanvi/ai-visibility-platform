const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const prisma = new PrismaClient();

// POST /api/blog - Create a new blog (admin only)
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
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
    console.error('POST /api/blog error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/blog - Get all published blogs with pagination
router.get('/', async (req, res) => {
  try {
    const { limit = 10, skip = 0, category, featured } = req.query;
    const where = { published: true };
    
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;

    const total = await prisma.blog.count({ where });

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: Number(skip),
      take: Number(limit),
    });

    res.json({ data: blogs, total });
  } catch (err) {
    console.error('GET /api/blog error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/blog/featured - Get featured blogs only
router.get('/featured', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const blogs = await prisma.blog.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    res.json({ data: blogs });
  } catch (err) {
    console.error('GET /api/blog/featured error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/blog/:id - Get single blog by ID or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await prisma.blog.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
        published: true,
      },
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Increment view count
    await prisma.blog.update({
      where: { id: blog.id },
      data: { views: { increment: 1 } },
    });

    res.json(blog);
  } catch (err) {
    console.error('GET /api/blog/:id error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/blog/category/:category - Get blogs by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    const where = { published: true, category };
    const total = await prisma.blog.count({ where });

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: Number(skip),
      take: Number(limit),
    });

    res.json({ data: blogs, total });
  } catch (err) {
    console.error('GET /api/blog/category/:category error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
