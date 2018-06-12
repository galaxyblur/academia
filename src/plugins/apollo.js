import { ApolloClient } from 'apollo-client';
import { ApolloLink, concat } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import VueApollo from 'vue-apollo';
import { getIdToken } from '../lib/AuthHelper';

export default ({ app, Vue }) => {
  const httpLink = new HttpLink({
    uri: 'https://api.graph.cool/simple/v1/cj4dihby0mn840142pmbfeztt',
  });

  const authMiddleware = new ApolloLink((operation, forward) => {
    const token = getIdToken();

    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : null,
      },
    });

    return forward(operation);
  });

  // Create the apollo client
  const apolloClient = new ApolloClient({
    link: concat(authMiddleware, httpLink),
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });

  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
  });

  app.provide = apolloProvider.provide();

  Vue.use(VueApollo);
};
