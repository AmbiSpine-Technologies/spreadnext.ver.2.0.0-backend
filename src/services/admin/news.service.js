import News from "../../models/news.model.js";
import { uploadToS3, deleteFromS3 } from "../../utils/s3.js"; // Your existing utility
import slugify from "slugify";

export const createNewsService = async (newsData, file) => {
  try {
    // 1. Check if file exists (Validation before S3)
    if (!file) {
      throw new Error("Featured image is required to publish news.");
    }

    // 2. Upload to S3
    const uploaded = await uploadToS3(file, "news/featured-images");

    // 3. Double check upload success
    if (!uploaded || !uploaded.url) {
      throw new Error("Failed to upload image to S3.");
    }

    const mediaData = { 
      url: uploaded.url, 
      key: uploaded.key || "" 
    };

    // 4. Create News Object
    const news = new News({
      ...newsData,
      featuredImage: mediaData,
      slug: slugify(newsData.title, { lower: true, strict: true }),
    });

    return await news.save();
  } catch (error) {
    // Rethrow error to be caught by Controller
    throw error;
  }
};


export const updateNews = async (id, updateData, file) => {
  const existingNews = await News.findById(id);
  if (!existingNews) throw new Error("News not found");

  let mediaData = existingNews.featuredImage;

  // Agar nayi file aayi hai: Purani delete karo -> Nayi upload karo
  if (file) {
    if (existingNews.featuredImage?.key) {
      await deleteFromS3(existingNews.featuredImage.key);
    }
    const key = await uploadFileToS3(file);
    const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    mediaData = { url, key };
  }

  const slug = updateData.title 
    ? slugify(updateData.title, { lower: true, strict: true }) 
    : existingNews.slug;

  return await News.findByIdAndUpdate(
    id,
    { ...updateData, featuredImage: mediaData, slug },
    { new: true }
  );
};

// 3. Get All (Public Feed)
export const fetchNewsFeed = async (category) => {
  const query = category && category !== "All" ? { category } : {};
  return await News.find(query).sort({ createdAt: -1 });
};

// 4. Get Single by Slug
export const fetchBySlug = async (slug) => {
  return await News.findOne({ slug });
};

// 5. Delete News
export const removeNews = async (id) => {
  const news = await News.findById(id);
  if (news?.featuredImage?.key) {
    await deleteFromS3(news.featuredImage.key); // S3 Cleanup
  }
  return await News.findByIdAndDelete(id);
};