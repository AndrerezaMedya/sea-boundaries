import PortalPageLayout from '@/components/portal/PortalPageLayout';
import RequestDataForm from '@/components/portal/RequestDataForm';

const RequestDataPage = () => {
    return (
        <PortalPageLayout showIntro={false}>
            <RequestDataForm />
        </PortalPageLayout>
    );
};

export default RequestDataPage;
