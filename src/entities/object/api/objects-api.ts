import { supabase } from "@/shared/api/client";

import type { IObject } from "../model/types/types";

interface ICreateObjectInput {
  name: string;
  address: string;
  createdBy: string;
}

interface IUpdateObjectInput {
  id: string;
  name: string;
  address: string;
}

export const getObjects = async (): Promise<IObject[]> => {
  const { data, error } = await supabase
    .from("objects")
    .select("id, name, address, created_at, created_by")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};

export const createObject = async ({
  name,
  address,
  createdBy,
}: ICreateObjectInput): Promise<IObject> => {
  const { data, error } = await supabase
    .from("objects")
    .insert({
      name,
      address,
      created_by: createdBy,
    })
    .select("id, name, address, created_at, created_by")
    .single();

  if (error) throw error;

  return data;
};

export const updateObject = async ({
  id,
  name,
  address,
}: IUpdateObjectInput): Promise<IObject> => {
  const { data, error } = await supabase
    .from("objects")
    .update({ name, address })
    .eq("id", id)
    .select("id, name, address, created_at, created_by")
    .single();

  if (error) throw error;

  return data;
};

export const deleteObject = async (id: string): Promise<void> => {
  const { error } = await supabase.from("objects").delete().eq("id", id);

  if (error) throw error;
};

export const getObjectById = async (id: string): Promise<IObject> => {
  const { data, error } = await supabase
    .from("objects")
    .select("id, name, address, created_at, created_by")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
};
