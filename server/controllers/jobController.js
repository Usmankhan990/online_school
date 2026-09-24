const { JobPost } = require('../models');

// Public: Get all active job postings
exports.getPublicJobs = async (req, res) => {
  try {
    const jobs = await JobPost.findAll({
      where: { is_active: true },
      order: [
        ['featured', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });
    res.json({ jobs });
  } catch (err) {
    console.error('Error fetching public jobs:', err);
    res.status(500).json({ error: 'Failed to fetch job postings.' });
  }
};

// Admin: Get all jobs (active and inactive)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await JobPost.findAll({
      order: [
        ['featured', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });
    res.json({ jobs });
  } catch (err) {
    console.error('Error fetching admin jobs:', err);
    res.status(500).json({ error: 'Failed to load jobs.' });
  }
};

// Admin: Create a new job
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      category,
      type,
      location,
      qualification,
      experience,
      description,
      skills,
      featured,
      is_active,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Job title is required.' });
    }

    const job = await JobPost.create({
      title: title.trim(),
      department: department?.trim() || 'General',
      category: category?.trim() || 'stem',
      type: type?.trim() || 'Part-Time / Full-Time',
      location: location?.trim() || 'Remote (100% Online)',
      qualification: qualification?.trim() || '',
      experience: experience?.trim() || '',
      description: description?.trim() || '',
      skills: skills || [],
      featured: Boolean(featured),
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    res.status(201).json({ message: 'Job post created successfully.', job });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ error: 'Failed to create job post.' });
  }
};

// Admin: Update job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobPost.findByPk(id);

    if (!job) {
      return res.status(404).json({ error: 'Job post not found.' });
    }

    const {
      title,
      department,
      category,
      type,
      location,
      qualification,
      experience,
      description,
      skills,
      featured,
      is_active,
    } = req.body;

    if (title !== undefined) job.title = title.trim();
    if (department !== undefined) job.department = department.trim();
    if (category !== undefined) job.category = category.trim();
    if (type !== undefined) job.type = type.trim();
    if (location !== undefined) job.location = location.trim();
    if (qualification !== undefined) job.qualification = qualification.trim();
    if (experience !== undefined) job.experience = experience.trim();
    if (description !== undefined) job.description = description.trim();
    if (skills !== undefined) job.skills = skills;
    if (featured !== undefined) job.featured = Boolean(featured);
    if (is_active !== undefined) job.is_active = Boolean(is_active);

    await job.save();

    res.json({ message: 'Job post updated successfully.', job });
  } catch (err) {
    console.error('Error updating job:', err);
    res.status(500).json({ error: 'Failed to update job post.' });
  }
};

// Admin: Delete job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobPost.findByPk(id);

    if (!job) {
      return res.status(404).json({ error: 'Job post not found.' });
    }

    await job.destroy();
    res.json({ message: 'Job post deleted successfully.' });
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).json({ error: 'Failed to delete job post.' });
  }
};

// Admin: Toggle active status
exports.toggleJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobPost.findByPk(id);

    if (!job) {
      return res.status(404).json({ error: 'Job post not found.' });
    }

    job.is_active = !job.is_active;
    await job.save();

    res.json({ message: `Job ${job.is_active ? 'activated' : 'deactivated'} successfully.`, job });
  } catch (err) {
    console.error('Error toggling job status:', err);
    res.status(500).json({ error: 'Failed to toggle job status.' });
  }
};

// Admin: Toggle featured status
exports.toggleJobFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobPost.findByPk(id);

    if (!job) {
      return res.status(404).json({ error: 'Job post not found.' });
    }

    job.featured = !job.featured;
    await job.save();

    res.json({ message: `Job ${job.featured ? 'marked as priority' : 'unmarked from priority'}.`, job });
  } catch (err) {
    console.error('Error toggling job featured status:', err);
    res.status(500).json({ error: 'Failed to toggle priority status.' });
  }
};
