import { Heading, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

import type { IObject } from "../model/types/types";

interface IObjectCardProps {
  object: IObject;
  actions?: ReactNode;
  showCreatedAt?: boolean;
}

export const ObjectCard = ({
  object,
  actions,
  showCreatedAt,
}: IObjectCardProps) => (
  <Stack gap="3">
    <Heading size="md">{object.name}</Heading>
    <Text color="fg.muted">{object.address}</Text>
    {showCreatedAt && (
      <Text fontSize="sm" color="fg.muted">
        Создан: {new Date(object.created_at).toLocaleDateString("ru-RU")}
      </Text>
    )}
    {actions}
  </Stack>
);
