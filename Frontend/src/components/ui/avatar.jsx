import { useState } from "react";
import { User } from "lucide-react";

/**
 * Avatar component - displays user profile picture or fallback initials
 * @param {string} src - Profile picture URL
 * @param {string} firstName - User's first name (for initials fallback)
 * @param {string} lastName - User's last name (for initials fallback)
 * @param {string} size - Size variant: 'sm', 'md', 'lg', 'xl'
 * @param {string} className - Additional CSS classes
 */
export function Avatar({
  src,
  firstName,
  lastName,
  size = "md",
  className = ""
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
    xl: "w-20 h-20 text-2xl",
  };

  const getInitials = () => {
    const first = firstName?.[0]?.toUpperCase() || "";
    const last = lastName?.[0]?.toUpperCase() || "";
    return first + last || "?";
  };

  const showImage = src && !imageError;

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        flex
        items-center
        justify-center
        overflow-hidden
        bg-gradient-to-br from-indigo-500 to-purple-500
        text-white
        font-bold
        flex-shrink-0
        ${className}
      `}
    >
      {showImage ? (
        <>
          <img
            src={src}
            alt={`${firstName} ${lastName}`}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            onLoad={() => setImageLoading(false)}
            className={`
              w-full
              h-full
              object-cover
              ${imageLoading ? 'opacity-0' : 'opacity-100'}
              transition-opacity
              duration-200
            `}
          />
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              {getInitials()}
            </div>
          )}
        </>
      ) : (
        <span>{getInitials()}</span>
      )}
    </div>
  );
}

/**
 * AvatarFallback - Simple fallback when no user data is available
 */
export function AvatarFallback({ size = "md", className = "" }) {
  const sizeClasses = {
    xs: "w-8 h-8",
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const iconSizes = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        flex
        items-center
        justify-center
        bg-gray-300
        text-gray-600
        flex-shrink-0
        ${className}
      `}
    >
      <User size={iconSizes[size]} />
    </div>
  );
}
