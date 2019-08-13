const path = require("path");
const { createFilePath } = require("gatsby-source-filesystem");

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (
    node.internal.type === "MarkdownRemark" &&
    node.frontmatter.title !== ""
  ) {
    const slug = createFilePath({
      node,
      getNode,
      // basePath: "posts",
    });
    createNodeField({
      node,
      name: "slug",
      value: `${slug}`,
    });
  }
};

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
  const pagePaths = {
    blog: "./src/posts/PostPage.js",
    project: "./src/projects/ProjectPage.js",
  };
  return new Promise((resolve, reject) => {
    graphql(`
      {
        allMarkdownRemark(
          filter: { fileAbsolutePath: { regex: "/atrostdotcom/" } }
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                type
              }
            }
          }
        }
        allContentfulTil {
          edges {
            node {
              title
              number
            }
          }
        }
      }
    `).then(result => {
      result.data.allMarkdownRemark.edges.forEach(({ node }) => {
        try {
          if (node && node.frontmatter && node.frontmatter.type) {
            createPage({
              path: node.fields.slug,
              component: path.resolve(pagePaths[node.frontmatter.type]),
              context: {
                slug: node.fields.slug,
              },
            });
          }
        } catch (error) {
          console.log(error);
        }
      });
      result.data.allContentfulTil.edges.forEach(({ node }) => {
        try {
          if (node && node.title && node.number) {
            createPage({
              path: `til/${node.number}`,
              component: path.resolve("./src/til/TilPage.js"),
              context: {
                title: node.title,
              },
            });
          }
        } catch (error) {
          console.log(error);
        }
      });
      resolve();
    });
  });
};
