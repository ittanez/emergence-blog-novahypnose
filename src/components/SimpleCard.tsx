import React from "react";
import { Link } from "react-router-dom";
import { Article } from "@/lib/types";

interface SimpleCardProps {
  article: Article;
}

const SimpleCard = ({ article }: SimpleCardProps) => {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        marginBottom: '20px',
        padding: '0',
        backgroundColor: 'white',
        display: 'block',
        position: 'relative'
      }}
    >
      <Link to={`/article/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* Image container */}
        <div
          style={{
            width: '100%',
            height: '200px',
            backgroundColor: '#f0f0f0',
            border: '2px solid #ddd',
            position: 'relative',
            marginBottom: '15px'
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
            />
          )}
        </div>

        {/* Text content */}
        <div
          style={{
            padding: '15px',
            backgroundColor: 'white',
            position: 'relative',
            zIndex: 10
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: 'black',
              lineHeight: '1.4'
            }}
          >
            {article.title}
          </h3>

          <p
            style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.5',
              marginBottom: '10px'
            }}
          >
            {article.excerpt}
          </p>

          <div
            style={{
              fontSize: '12px',
              color: '#999',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>Article</span>
            <span>Lecture</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SimpleCard;