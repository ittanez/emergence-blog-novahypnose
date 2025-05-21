
import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput = ({ label, tags, onChange, placeholder = 'Ajouter un tag...' }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      const newTags = [...tags, trimmedValue];
      onChange(newTags);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      const newTags = [...tags];
      newTags.pop();
      onChange(newTags);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex flex-wrap gap-2 p-2 bg-background rounded-md border border-input min-h-10">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button 
              type="button"
              onClick={() => removeTag(tag)}
              className="text-gray-500 hover:text-gray-700"
              aria-label={`Supprimer le tag ${tag}`}
            >
              <X size={14} />
            </button>
          </Badge>
        ))}
        <div className="flex-1">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={placeholder}
            className="border-0 focus-visible:ring-0 p-0 h-7"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Appuyez sur Entrée ou virgule pour ajouter un tag
      </p>
    </div>
  );
};

export default TagInput;
