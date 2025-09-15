import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Article } from "@/lib/types";

interface SimpleCardProps {
  article: Article;
}

const SimpleCard = ({ article }: SimpleCardProps) => {
  const formattedDate = format(new Date(article.published_at || article.created_at), "d MMMM yyyy", {
    locale: fr
  });

  const getReadTime = () => {
    if (article.read_time && article.read_time > 1) {
      return article.read_time;
    }

    if (article.content) {
      const plainText = article.content.replace(/<[^>]*>/g, '');
      const wordCount = plainText.trim().split(/\s+/).length;
      const calculatedTime = Math.max(1, Math.ceil(wordCount / 200));
      return calculatedTime;
    }

    return article.read_time || 1;
  };

  const readTime = getReadTime();

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '20px',
        padding: '0',
        backgroundColor: 'white',
        display: 'block',
        position: 'relative',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
      }}
    >
      <Link to={`/article/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* Image container */}
        <div
          style={{
            width: '100%',
            height: '200px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px 8px 0 0',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              loading="lazy"
            />
          )}
        </div>

        {/* Text content */}
        <div
          style={{
            padding: '20px',
            backgroundColor: 'white',
            position: 'relative',
            zIndex: 10
          }}
        >
          {/* Tags */}
          {article.categories && article.categories.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              {article.categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    marginRight: '8px'
                  }}
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          <h3
            style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#1f2937',
              lineHeight: '1.4',
              fontFamily: '"Playfair Display", serif'
            }}
          >
            {article.title}
          </h3>

          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.6',
              marginBottom: '16px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {article.excerpt}
          </p>

          <div
            style={{
              fontSize: '12px',
              color: '#9ca3af',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>{formattedDate}</span>
            <span>{readTime} min de lecture</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SimpleCard;