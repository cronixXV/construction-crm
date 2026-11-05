import { Heading, Stack } from "@chakra-ui/react";
import { ObjectsList } from "@/widgets/objects-list";

export const ObjectsPage = () => (
  <Stack gap="6">
    <Heading size="xl">Объекты</Heading>
    <ObjectsList />
  </Stack>
);
