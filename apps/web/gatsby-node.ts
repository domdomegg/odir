// See: https://www.gatsbyjs.org/docs/node-apis/

import { GatsbyNode } from 'gatsby';

// eslint-disable-next-line import/prefer-default-export
export const onCreatePage: GatsbyNode['onCreatePage'] = async ({ page, actions }) => {
  const { deletePage } = actions;

  if (page.path === '/') {
    // eslint-disable-next-line no-param-reassign
    page.matchPath = '/*';
  } else if (page.path.startsWith('/')) {
    deletePage(page);
  }
};
