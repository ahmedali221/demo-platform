declare module "mfDataExport/DataImportPage" {
  import { NavItemId } from "@ops-brain/shared";

  export interface DataImportPageProps {
    onNavigate?: (id: NavItemId) => void;
  }

  const DataImportPage: React.FC<DataImportPageProps>;
  export default DataImportPage;
}

declare module "mfDataExport/ImportLogsPage" {
  import { NavItemId } from "@ops-brain/shared";

  export interface ImportLogsPageProps {
    onNavigate?: (id: NavItemId) => void;
  }

  const ImportLogsPage: React.FC<ImportLogsPageProps>;
  export default ImportLogsPage;
}

declare module "mfCouriers/CouriersPage" {
  import { NavItemId } from "@ops-brain/shared";

  export interface CouriersPageProps {
    onNavigate?: (id: NavItemId) => void;
  }

  const CouriersPage: React.FC<CouriersPageProps>;
  export default CouriersPage;
}
declare module "mfReports/CouriersReportPage" {
  const CouriersReportPage: React.FC;
  export default CouriersReportPage;
}

declare module "mfReports/CompaniesReportPage" {
  const CompaniesReportPage: React.FC;
  export default CompaniesReportPage;
}

declare module "mfCouriers/CouriersProfile" {
  import { NavItemId } from "@ops-brain/shared";

  export interface CouriersProfileProps {
    onNavigate?: (id: NavItemId) => void;
  }

  const CouriersProfile: React.FC<CouriersProfileProps>;
  export default CouriersProfile;
}
