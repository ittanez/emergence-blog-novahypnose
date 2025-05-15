
import { supabase } from './supabase';

export async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    
    // Create authors table
    const { error: authorsError } = await supabase
      .from('')
      .sql(`
        CREATE TABLE IF NOT EXISTS authors (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          bio TEXT,
          avatar_url TEXT,
          email TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    if (authorsError) throw authorsError;
    console.log('Authors table created or already exists');
    
    // Create categories table
    const { error: categoriesError } = await supabase
      .from('')
      .sql(`
        CREATE TABLE IF NOT EXISTS categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    if (categoriesError) throw categoriesError;
    console.log('Categories table created or already exists');
    
    // Create tags table
    const { error: tagsError } = await supabase
      .from('')
      .sql(`
        CREATE TABLE IF NOT EXISTS tags (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL UNIQUE,
          slug TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    if (tagsError) throw tagsError;
    console.log('Tags table created or already exists');
    
    // Create articles table
    const { error: articlesError } = await supabase
      .from('')
      .sql(`
        CREATE TABLE IF NOT EXISTS articles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          excerpt TEXT,
          image_url TEXT,
          seo_description TEXT,
          keywords TEXT[],
          category UUID NOT NULL REFERENCES categories(id),
          author_id UUID NOT NULL REFERENCES authors(id),
          slug TEXT NOT NULL UNIQUE,
          read_time INTEGER,
          published BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    if (articlesError) throw articlesError;
    console.log('Articles table created or already exists');
    
    // Create article_tags junction table
    const { error: articleTagsError } = await supabase
      .from('')
      .sql(`
        CREATE TABLE IF NOT EXISTS article_tags (
          article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
          tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
          PRIMARY KEY (article_id, tag_id)
        );
      `);
    if (articleTagsError) throw articleTagsError;
    console.log('Article_tags table created or already exists');
    
    // Create subscribers table
    const { error: subscribersError } = await supabase
      .from('')
      .sql(`
        CREATE TABLE IF NOT EXISTS subscribers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          verified BOOLEAN DEFAULT false
        );
      `);
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
