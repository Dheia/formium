import * as React from 'react';
import { FormiumForm } from '@formium/react';
import { formium } from '../../lib/formium';
import { useRouter } from 'next/router';
import { FormiumBaseWebComponents } from '../../components/FormiumComponents';

export default function FormPage(props) {
  const [success, setSuccess] = React.useState(false);
  const [data, setData] = React.useState({});
  const router = useRouter();
  if (success) {
    return (
      <div>
        <h1>Thank you! Your response has been recorded.</h1>
        <br />
        {props.preview ? (
          <>
            <hr />
            <p>
              <small>
                Note: This was a test submission. It would have produced this
                data:
              </small>
            </p>
            <pre style={{ fontSize: 11 }}>{JSON.stringify(data, null, 2)}</pre>
            <button type="button" onClick={() => window.location.reload()}>
              Reset Form
            </button>
            <hr />
          </>
        ) : null}
      </div>
    );
  }
  return (
    <>
      <FormiumForm
        data={props.form}
        components={FormiumBaseWebComponents}
        onSubmit={async values => {
          if (props.preview) {
            setData(values);
          } else {
            await formium.submitForm(router.query.slug, values);
          }
          setSuccess(true);
        }}
      />
    </>
  );
}

export const getStaticProps = async ({
  params,
  preview = false,
  previewData = {},
}) => {
  if (params?.slug) {
    try {
      const form = await formium.getFormBySlug(params.slug, previewData);
      return {
        props: {
          preview,
          form: form || null,
        },
      };
    } catch (e) {
      console.log(e);
    }
  }

  return {
    props: {},
  };
};

export const getStaticPaths = async () => {
  try {
    const { data: forms, next } = await formium.findForms();
    // Map forms to just slugs
    return {
      paths: forms.map(form => ({
        params: { slug: form.slug },
      })),
      fallback: false,
    };
  } catch (error) {
    console.log(error);
  }
};
