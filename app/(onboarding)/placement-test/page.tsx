import type { Metadata } from "next";
import { PlacementTestRunner } from "@/components/features/placement/placement-test-runner";

export const metadata: Metadata = { title: "Placement test" };

export default function PlacementTestPage() {
  return <PlacementTestRunner />;
}
