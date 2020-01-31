import React from "react";
import ReactDOM from "react-dom";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
  from
} from "@apollo/client";
import { onError } from "@apollo/link-error";
import { setContext } from "@apollo/link-context";

import Demo from "./demo";

export function offsetLimitPaginatedField<T>() {
  return {
    keyArgs: ["where"],
    merge(existing: any, incoming: any, { args }: { args: any }) {
      // Insert the incoming elements in the right places, according to args.
      if (
        args &&
        "offset" in args &&
        "limit" in args &&
        typeof args.offset !== "undefined" &&
        typeof args.limit !== "undefined"
      ) {
        const merged = existing ? existing.slice(0) : [];
        const end = args.offset + Math.min(args.limit, incoming.length);
        for (let i = args.offset; i < end; ++i) {
          merged[i] = incoming[i - args.offset];
        }
        return merged;
      }
      return incoming;
    },
    read(existing: any, { args }: { args: any }) {
      // If we read the field before any data has been written to the
      // cache, this function will return undefined, which correctly
      // indicates that the field is missing.
      const page =
        existing &&
        args &&
        "offset" in args &&
        "limit" in args &&
        typeof args.offset !== "undefined" &&
        typeof args.limit !== "undefined"
          ? existing
              .slice(args.offset, args.offset + args.limit)
              // we filter for empty spots because its likely we have padded spots with nothing in them.
              .filter((p: any) => p)
          : existing;
      // If we ask for a page outside the bounds of the existing array,
      // page.length will be 0, and we should return undefined instead of
      // the empty array.
      if (page && page.length > 0) {
        return page;
      }
    }
  };
}

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        books: offsetLimitPaginatedField(),
        books_by_pk(existingData, { args, toReference }) {
          return (
            existingData || toReference({ __typename: "books", id: args.id })
          );
        }
      }
    }
  }
});

// const authLink = setContext(async () => {
//   // let accessToken = getAccessToken();
//   // const exp: any = getAccessTokenExp();
//   // if (accessToken === '' || (accessToken && Date.now() >= exp * 1000)) {
//     // console.log('fetch token');
//     // accessToken = await fetchRefreshToken();
//   // }
//   // return { accessToken };
//   return {}
// });

// const setAuthorizationLink = setContext((_, { accessToken }) => {
//   return {
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//   };
// });

const client = new ApolloClient({
  link: from([
    // authLink,
    // setAuthorizationLink,
    new HttpLink({
      uri: `https://test-ac3.herokuapp.com/v1/graphql`
      // credentials: 'include',
    })
  ]),
  cache
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <Demo />
  </ApolloProvider>,
  document.querySelector("#root")
);
