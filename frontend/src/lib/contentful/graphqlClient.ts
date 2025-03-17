import { GraphQLClient } from 'graphql-request';

const endpoint = `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`;

export const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
  },
});

export const previewGraphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.CONTENTFUL_PREVIEW_TOKEN}`,
  },
});

export const getClient = (preview: boolean) => 
  preview ? previewGraphQLClient : graphQLClient;