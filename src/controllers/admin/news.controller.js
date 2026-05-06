import * as newsService from "../../services/admin/news.service.js";

export const publishNews = async (req, res) => {
  try {
    const news = await newsService.createNewsService(req.body, req.file);
    res.status(201).json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const editNews = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await newsService.updateNews(id, req.body, req.file);
    res.status(200).json({ success: true, data: updated, message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNewsList = async (req, res) => {
  try {
    const { category } = req.query;
    const news = await newsService.fetchNewsFeed(category);
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNewsDetails = async (req, res) => {
  try {
    const news = await newsService.fetchBySlug(req.params.slug);
    if (!news) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNewsItem = async (req, res) => {
  try {
    await newsService.removeNews(req.params.id);
    res.status(200).json({ success: true, message: "News deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};