import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Center,
  CircularProgress,
  Heading,
  HStack,
  Stack,
} from "@chakra-ui/react";
import GradientHeading from "components/GradientHeading";
import IPTable from "components/IPTable";
import SearchInput from "components/SearchInput";
import jsonFetcher from "integrations/jsonFetcher";
import { SearchResult } from "models/SearchResult";
import Error from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import pluralize from "pluralize";
import React from "react";
import useSWR from "swr";

const SearchPage: React.FC = () => {
  const { query } = useRouter();
  const { data, error } = useSWR<SearchResult[]>(
    `/api/search?query=${query.query}`,
    jsonFetcher
  );

  const resultCount = (data) => data.flatMap((result) => result.results).length;
  if (error) return <Error statusCode={500} />;
  return (
    <>
      <Head>
        <title>
          {data
            ? `${pluralize("result", resultCount(data), true)} for '${
                query.query
              }'`
            : "Searching..."}
        </title>
      </Head>
      <Stack direction={{ base: "column", lg: "row" }} spacing={10}>
        <GradientHeading flexShrink={0}>
          {data
            ? data.length > 0
              ? `${pluralize("result", resultCount(data), true)} for '${
                  query.query
                }' in ${pluralize("site", data.length, true)}`
              : `No results for '${query.query}'`
            : `Searching for '${query.query}'...`}
        </GradientHeading>
      </Stack>
      <SearchInput mt={4} hasButton />
      {data ? (
        <Accordion defaultIndex={data.map((_, i) => i)} allowMultiple mt={10}>
          {data
            .sort((a, b) => (a.site.display < b.site.display ? -1 : 1))
            .map((result) => {
              return (
                <AccordionItem key={result.site.id}>
                  <AccordionButton>
                    <HStack w="full" justify="space-between">
                      <Heading size="md">{`${result.site.display} (${result.results.length})`}</Heading>
                      <AccordionIcon />
                    </HStack>
                  </AccordionButton>
                  <AccordionPanel pt={0}>
                    <IPTable pb={10} addresses={result.results} />
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
        </Accordion>
      ) : (
        <Center h="90vh" w="100%">
          <CircularProgress isIndeterminate />
        </Center>
      )}
    </>
  );
};

export default SearchPage;