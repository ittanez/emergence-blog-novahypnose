
import { supabase } from './supabase';

export async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    
    // Create authors table
    const { error: authorsError } = await supabase
      .rpc('create_authors_table');
      
    if (authorsError) throw authorsError;
    console.log('Authors table created or already exists');
    
    // Create categories table
    const { error: categoriesError } = await supabase
      .rpc('create_categories_table');
      
    if (categoriesError) throw categoriesError;
    console.log('Categories table created or already exists');
    
    // Create tags table
    const { error: tagsError } = await supabase
      .rpc('create_tags_table');
      
    if (tagsError) throw tagsError;
    console.log('Tags table created or already exists');
    
    // Create articles table
    const { error: articlesError } = await supabase
      .rpc('create_articles_table');
      
    if (articlesError) throw articlesError;
    console.log('Articles table created or already exists');
    
    // Create article_tags junction table
    const { error: articleTagsError } = await supabase
      .rpc('create_article_tags_table');
      
    if (articleTagsError) throw articleTagsError;
    console.log('Article_tags table created or already exists');
    
    // Create subscribers table
    const { error: subscribersError } = await supabase
      .rpc('create_subscribers_table');
      
    if (subscribersError) throw subscribersError;
    console.log('Subscribers table created or already exists');
    
    console.log('Database setup completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Database setup failed:', error);
    return { success: false, error };
  }
}

export async function setupStorageBucket() {
  try {
    // Check if bucket exists first
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'blog_images');
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket('blog_images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB in bytes
      });
      
      if (error) throw error;
      console.log('Storage bucket "blog_images" created successfully');
    } else {
      console.log('Storage bucket "blog_images" already exists');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Storage bucket setup failed:', error);
    return { success: false, error };
  }
}
