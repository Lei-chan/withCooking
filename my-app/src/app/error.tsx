"use client";

export default function Error({ error }: { error: Error }) {
  return <>{error.message}</>;
}
