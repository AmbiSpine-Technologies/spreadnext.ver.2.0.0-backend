import News from "../../models/news.model.js";
import { uploadToS3, deleteFromS3 } from "../../utils/s3.js"; // Your existing utility
import slugify from "slugify";

export const createNewsService = async (newsData, file) => {
  try {
    if (!file) {
      throw new Error("Featured image is required to publish news.");
    }
if (newsData.isFeatured === "true" || newsData.isFeatured === true) {
    await News.updateMany({ isFeatured: true }, { isFeatured: false });
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
      isFeatured: newsData.isFeatured === "true"
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

  const { featuredImage, ...cleanUpdateData } = updateData;

  let mediaData = existingNews.featuredImage;

  // 1. Reset other featured articles safely
  if (cleanUpdateData.isFeatured === "true" || cleanUpdateData.isFeatured === true) {
    await News.updateMany(
      { _id: { $ne: id }, isFeatured: true }, 
      { isFeatured: false }
    );
  }

  // 2. Process physical file swap
  if (file) {
    // Delete the old file if it exists
    if (existingNews.featuredImage?.key) {
      try {
        await deleteFromS3(existingNews.featuredImage.key);
      } catch (err) {
        console.error("Non-blocking old S3 asset deletion failure:", err);
      }
    }
    
    // Upload new image
    const uploaded = await uploadToS3(file, "news/featured-images");
    if (!uploaded || !uploaded.url) {
      throw new Error("Failed to upload new image to S3.");
    }
    
    mediaData = { 
      url: uploaded.url, 
      key: uploaded.key || "" 
    };
  }

  // 3. Generate stable URL safe slug
  const slug = cleanUpdateData.title 
    ? slugify(cleanUpdateData.title, { lower: true, strict: true }) 
    : existingNews.slug;

  // 4. Update with explicit control blocks
  return await News.findByIdAndUpdate(
    id,
    { 
      ...cleanUpdateData, 
      featuredImage: mediaData, 
      slug,
      isFeatured: cleanUpdateData.isFeatured === "true" || cleanUpdateData.isFeatured === true
    },
    { new: true, runValidators: true } // runValidators protects schema structure
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