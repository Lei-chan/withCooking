"use client";

export default function Error({ error }: { error: any }) {
  return <>{error.message}</>;
}
