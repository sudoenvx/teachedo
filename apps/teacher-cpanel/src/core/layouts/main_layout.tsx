import { Outlet } from "react-router-dom";
import {
  Layout,
  LayoutBody,
  LayoutContent,
  LayoutHeader,
  LayoutInset,
} from "@teachedo/ui/components";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

function MainLayout() {
  return (
    <Layout dir="rtl" storagePrefix="teacher-layout:v1">
      <LayoutHeader>
        <Navbar />
      </LayoutHeader>

      <LayoutBody>
        <Sidebar />

        <LayoutInset>
          <LayoutContent><Outlet /></LayoutContent>
        </LayoutInset>
      </LayoutBody>
    </Layout>
  );
}

export default MainLayout;
