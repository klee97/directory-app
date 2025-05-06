import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Box from '@mui/material/Box';
import CircleIcon from '@mui/icons-material/Circle';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Privacy Policy
      </Typography>

      <Typography component="p">
        This Privacy Policy describes how Asian Wedding Makeup (the &quot;Site&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and discloses your personal information when you visit, use our services including asianweddingmakeup.com (the &quot;Site&quot;) or otherwise communicate with us (collectively, the &quot;Services&quot;). For purposes of this Privacy Policy, &quot;you&quot; and &quot;your&quot; means you as the user of the Services, whether you are a customer, website visitor, vendor, or another individual whose information we have collected pursuant to this Privacy Policy.
      </Typography>

      <Typography component="p">
        Please read this Privacy Policy carefully. By using and accessing any of the Services, you agree to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree to this Privacy Policy, please do not use or access any of the Services.
      </Typography>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Changes to This Privacy Policy
        </Typography>
        <Typography component="p">
          We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on the Site, update the &quot;Last updated&quot; date and take any other steps required by applicable law.
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          How We Collect and Use Your Personal Information
        </Typography>
        <Typography component="p">
          To provide the Services, we collect personal information about you from a variety of sources, as set out below. The information that we collect and uses varies depending on how you interact with us.
        </Typography>

        <Typography component="p">
          In addition to the specific uses set out below, we may use information we collect about you to communicate with you, provide the Services, comply with any applicable legal obligations, enforce any applicable terms of service, and to protect or defend the Services, our rights, and the rights of our users or others.
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          What Personal Information We Collect
        </Typography>
        <Typography component="p">
          The types of personal information we obtain about you depends on how you interact with our Site and use our Services. When we use the term &quot;personal information&quot;, we are referring to information that identifies, relates to, describes or can be associated with you. The following sections describe the categories and specific types of personal information we collect.
        </Typography>

        <Box sx={{ my: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Information We Collect Directly from You
          </Typography>
          <Typography component="p">
            When you create an account or use our Services, we collect:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CircleIcon sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText
                primary="User account information: Name, email address, password, profile information"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CircleIcon sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText
                primary="User preferences: Favorited vendors, saved searches"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CircleIcon sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText
                primary="Authentication data: Information needed for Supabase user authentication"
              />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Information We Collect Through Your Usage
          </Typography>
          <Typography component="p">
            We collect information about your interaction with the Services, including:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CircleIcon sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText
                primary="Activity data: Pages visited, features used, vendors viewed or contacted"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CircleIcon sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText
                primary="Analytics data: Through Microsoft Clarity, we collect usage patterns, heatmaps, and session recordings to improve our Services"
              />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Information We Collect through Cookies
          </Typography>
          <Typography component="p">
            We also automatically collect certain information about your interaction with the Services (&quot;Usage Data&quot;). To do this, we may use cookies, pixels and similar technologies (&quot;Cookies&quot;). Usage Data may include information about how you access and use our Site and your account, including device information, browser information, information about your network connection, your IP address and other information regarding your interaction with the Services.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Information We Obtain from Third Parties
          </Typography>
          <Typography component="p">
            We may obtain information about you from third parties, including from vendors and service providers who may collect information on our behalf, such as:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CircleIcon sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText
                primary="Authentication service providers, such as Supabase"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CircleIcon sx={{ fontSize: 8 }} />
              </ListItemIcon>
              <ListItemText
                primary="Analytics providers, such as Microsoft Clarity"
              />
            </ListItem>
          </List>
          <Typography component="p">
            Any information we obtain from third parties will be treated in accordance with this Privacy Policy. We are not responsible or liable for the accuracy of the information provided to us by third parties and are not responsible for any third party&apos;s policies or practices.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          How We Use Your Personal Information
        </Typography>

        <Box sx={{ my: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Providing Products and Services
          </Typography>
          <Typography component="p">
            We use your personal information to provide you with the Services in order to perform our contract with you, including to create, maintain and otherwise manage your account, save your vendor favorites, and enable you to use the directory features.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Improving Our Services
          </Typography>
          <Typography component="p">
            We analyze user behavior and preferences to enhance user experience, troubleshoot technical issues, and develop new features.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Marketing and Advertising
          </Typography>
          <Typography component="p">
            We only use your personal information for marketing and promotional purposes if you have explicitly signed up for our newsletter. If you choose to subscribe, we may send marketing, advertising and promotional communications by email. You can unsubscribe from these communications at any time by using the unsubscribe option in the emails. We do not use your account information or browsing behavior for marketing purposes unless you have specifically opted in to receive our newsletter.
          </Typography>
        </Box>

        <Box sx={{ my: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Communicating with you
          </Typography>
          <Typography component="p">
            We use your personal information to provide you with customer support and improve our Services. This is in our legitimate interests in order to be responsive to you, to provide effective services to you, and to maintain our business relationship with you.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Cookies
        </Typography>
        <Typography component="p">
          Like many websites, we use Cookies on our Site. We use Cookies to power and improve our Site and our Services (including to remember your actions and preferences), to run analytics and better understand user interaction with the Services (in our legitimate interests to administer, improve and optimize the Services). We may also permit third parties and services providers to use Cookies on our Site to better tailor the services, products and advertising on our Site and other websites.
        </Typography>

        <Typography component="p">
          Most browsers automatically accept Cookies by default, but you can choose to set your browser to remove or reject Cookies through your browser controls. Please keep in mind that removing or blocking Cookies can negatively impact your user experience and may cause some of the Services, including certain features and general functionality, to work incorrectly or no longer be available. Additionally, blocking Cookies may not completely prevent how we share information with third parties such as our advertising partners.
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          How We Disclose Personal Information
        </Typography>
        <Typography component="p">
          In certain circumstances, we may disclose your personal information to third parties for legitimate purposes subject to this Privacy Policy. Such circumstances may include:
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="With vendors or other third parties who perform services on our behalf (e.g., IT management, payment processing, data analytics, customer support, cloud storage)"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="In connection with a business transaction such as a merger or bankruptcy, to comply with any applicable legal obligations (including to respond to subpoenas, search warrants and similar requests), to enforce any applicable terms of service, and to protect or defend the Services, our rights, and the rights of our users or others"
            />
          </ListItem>
        </List>

        <Typography paragraph sx={{ mt: 2 }}>
          We may disclose the following categories of personal information about users for the purposes set out above:
        </Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
          Categories of Personal Information:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="Identifiers such as basic contact details and account information"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="Internet or other similar network activity, such as Usage Data"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="User preferences and favorited vendors"
            />
          </ListItem>
        </List>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
          Categories of Recipients:
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="Vendors and third parties who perform services on our behalf (such as Supabase, Microsoft Clarity, Internet service providers, payment processors, and data analytics providers)"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="Business and marketing partners"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="Affiliates"
            />
          </ListItem>
        </List>

        <Typography paragraph sx={{ mt: 2 }}>
          We do not use or disclose sensitive personal information for the purposes of inferring characteristics about you.
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Authentication
        </Typography>
        <Typography component="p">
          User authentication is handled via Supabase, and we implement industry-standard security measures to protect your login credentials and personal information.
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Third Party Websites and Links
        </Typography>
        <Typography component="p">
          Our Site may provide links to websites or other online platforms operated by third parties, including vendor websites. If you follow links to sites not affiliated or controlled by us, you should review their privacy and security policies and other terms and conditions. We do not guarantee and are not responsible for the privacy or security of such sites, including the accuracy, completeness, or reliability of information found on these sites. Information you provide on public or semi-public venues, including information you share on third-party social networking platforms may also be viewable by other users of the Services and/or users of those third-party platforms without limitation as to its use by us or by a third party. Our inclusion of such links does not, by itself, imply any endorsement of the content on such platforms or of their owners or operators, except as disclosed on the Services.
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Children&apos;s Data
        </Typography>
        <Typography component="p">
          The Services are not intended to be used by children, and we do not knowingly collect any personal information about children. If you are the parent or guardian of a child who has provided us with their personal information, you may contact us using the contact details set out below to request that it be deleted.
        </Typography>

        <Typography component="p">
          As of the Effective Date of this Privacy Policy, we do not have actual knowledge that we &quot;share&quot; or &quot;sell&quot; (as those terms are defined in applicable law) personal information of individuals under 16 years of age.
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Security and Retention of Your Information
        </Typography>
        <Typography component="p">
          Please be aware that no security measures are perfect or impenetrable, and we cannot guarantee &quot;perfect security.&quot; In addition, any information you send to us may not be secure while in transit. We recommend that you do not use unsecure channels to communicate sensitive or confidential information to us.
        </Typography>

        <Typography component="p">
          How long we retain your personal information depends on different factors, such as whether we need the information to maintain your account, to provide the Services, comply with legal obligations, resolve disputes or enforce other applicable contracts and policies.
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Your Rights and Choices
        </Typography>
        <Typography component="p">
          Depending on where you live, you may have some or all of the rights listed below in relation to your personal information. However, these rights are not absolute, may apply only in certain circumstances and, in certain cases, we may decline your request as permitted by law.
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="Right to Access / Know: You may have a right to request access to personal information that we hold about you, including details relating to the ways in which we use and share your information."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="Right to Delete: You may have a right to request that we delete personal information we maintain about you."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="Right to Correct: You may have a right to request that we correct inaccurate personal information we maintain about you."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="Right of Portability: You may have a right to receive a copy of the personal information we hold about you and to request that we transfer it to a third party, in certain circumstances and with certain exceptions."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="Restriction of Processing: You may have the right to ask us to stop or restrict our processing of personal information."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="Withdrawal of Consent: Where we rely on consent to process your personal information, you may have the right to withdraw this consent."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="Appeal: You may have a right to appeal our decision if we decline to process your request. You can do so by replying directly to our denial."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText
              primary="Managing Communication Preferences: We may send you promotional emails, and you may opt out of receiving these at any time by using the unsubscribe option displayed in our emails to you. If you opt out, we may still send you non-promotional emails, such as those about your account or security updates."
            />
          </ListItem>
        </List>

        <Typography paragraph sx={{ mt: 2 }}>
          You may exercise any of these rights where indicated on our Site or by contacting us using the contact details provided below.
        </Typography>

        <Typography component="p">
          We will not discriminate against you for exercising any of these rights. We may need to collect information from you to verify your identity, such as your email address or account information, before providing a substantive response to the request. In accordance with applicable laws, you may designate an authorized agent to make requests on your behalf to exercise your rights. Before accepting such a request from an agent, we will require that the agent provide proof you have authorized them to act on your behalf, and we may need you to verify your identity directly with us. We will respond to your request in a timely manner as required under applicable law.
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Complaints
        </Typography>
        <Typography component="p">
          If you have complaints about how we process your personal information, please contact us using the contact details provided below. If you are not satisfied with our response to your complaint, depending on where you live you may have the right to appeal our decision by contacting us using the contact details set out below, or lodge your complaint with your local data protection authority.
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          International Users
        </Typography>
        <Typography component="p">
          Please note that we may transfer, store and process your personal information outside the country you live in, including the United States. Your personal information is also processed by staff and third party service providers and partners in these countries.
        </Typography>

        <Typography component="p">
          If we transfer your personal information out of Europe, we will rely on recognized transfer mechanisms like the European Commission&apos;s Standard Contractual Clauses, or any equivalent contracts issued by the relevant competent authority of the UK, as relevant, unless the data transfer is to a country that has been determined to provide an adequate level of protection.
        </Typography>
      </Box>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Contact
        </Typography>
        <Typography component="p">
          Should you have any questions about our privacy practices or this Privacy Policy, or if you would like to exercise any of the rights available to you, please email us at katrina@asianweddingmakeup.com.
        </Typography>
      </Box>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Last updated: April 9, 2025
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;