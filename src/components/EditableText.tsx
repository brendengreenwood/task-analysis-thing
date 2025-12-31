import React, { useState, useEffect, useRef } from 'react';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  className = "",
  placeholder = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(value || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    const trimmedText = text?.trim() || '';
    if (trimmedText !== "") {
      onSave(trimmedText);
    } else {
      setText(value || '');
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmedText = text?.trim() || '';
      if (trimmedText !== "") {
        onSave(trimmedText);
      } else {
        setText(value || '');
      }
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setText(value || '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer ${className} ${!value && 'text-gray-400'}`}
      title="Click to edit"
    >
      {value || placeholder}
    </span>
  );
};