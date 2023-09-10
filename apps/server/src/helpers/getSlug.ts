import { ulid } from 'ulid';
import { scan } from './db';
import { slugTable } from './tables';

const RESERVED_SLUGS = new Set([
  // used
  'admin', 'new', 'login-callback', 'profile',
  // not used, but might be in future
  'user', 'login', 'register', 'default', 'home', 'error', 'debug', 'tools'
]);

/**
 * This is a helper function that finds an available id and slug for a new entity.
 * @param name The entity's name to base the slug on
 * @returns An id for the new entity, and an available slug.
 */
export const getSlug = async (name: string): Promise<{ id: string, slug: string }> => {
  const allSlugs = await scan(slugTable);
  const id = ulid();
  const slugBase = name.toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  for (let i = 1; i <= 10; i++) {
    const attemptedSlug = i === 1 ? slugBase : `${slugBase}-${i}`;
    const alreadyUsed = !!allSlugs.find((slug) => slug.value === attemptedSlug);
    if (!alreadyUsed && !RESERVED_SLUGS.has(attemptedSlug)) {
      return {
        id,
        slug: attemptedSlug
      };
    }
  }

  // If after 10 attempts we haven't found an available slug, give up and just use the ID
  return {
    id,
    slug: id
  };
};
