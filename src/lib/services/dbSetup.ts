import { supabase } from './supabase';

export async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    
    // Create all the tables directly using SQL instead of RPC functions
    const { error } = await supabase
      .from('articles')  // Just checking if the articles table exists
      .select('id')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, we need to run the SQL scripts to create tables
      console.log('Tables do not exist, please run the SQL scripts in the Supabase dashboard');
      return { success: false, error: 'Tables not found' };
    }
    
    console.log('Database tables already exist');
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

/**
 * Creates the database function to get article ID by slug
 */
export async function setupArticleFunctions() {
  const { error } = await supabase.rpc('create_get_article_id_by_slug_function');
  if (error) {
    console.error('Error setting up article functions:', error);
    return { success: false, error };
  }
  return { success: true, error: null };
}
