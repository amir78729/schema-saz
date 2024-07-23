// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React from 'react';
import { Story } from '@storybook/react';
import SchemaBuilder from '../components/SchemaBuilder';
import { STRING_WIDGETS } from '../constants';
import { SchemaProvider } from '../providers/SchemaProvider';
import { createTheme, ThemeProvider } from '@mui/material';
import { RJSFSchema } from '@rjsf/utils';

const sampleSchema: RJSFSchema = {
  title: 'Example Schema',
  description: 'A rich JSON schema example without dependencies and no nested objects.',
  type: 'object',
  properties: {
    id: {
      title: 'Identifier',
      description: 'A unique identifier for the item.',
      type: 'string',
      pattern: '^[a-zA-Z0-9-]+$',
    },
    name: {
      title: 'Name',
      description: 'The name of the item.',
      type: 'string',
      minLength: 1,
    },
    type: {
      title: 'Type',
      description: 'The type of the item.',
      type: 'string',
      enum: ['grocery', 'cloths'],
      enumNames: ['Grocery', 'Cloths'],
    },
    price: {
      title: 'Price',
      description: 'The price of the item.',
      type: 'number',
      minimum: 0,
    },
    location: {
      title: 'Location',
      description: 'The coordination.',
      type: 'object',
      properties: {
        lat: {
          type: 'number',
          title: 'latitude',
        },
        long: {
          type: 'number',
          title: 'longitude',
        },
      },
    },
    tags: {
      title: 'Tags',
      description: 'Tags associated with the item.',
      type: 'array',
      items: {
        type: 'string',
        title: 'Tag Name',
      },
      uniqueItems: true,
    },
    faq: {
      title: 'FAQ',
      type: 'array',
      items: {
        type: 'object',
        title: 'List of Questions',
        properties: {
          question: {
            title: 'question',
            type: 'string',
          },
          answer: {
            title: 'answer',
            type: 'string',
          },
        },
      },
      uniqueItems: true,
    },
    birthday: {
      title: 'Birthday Date',
      type: 'string',
      minimum: 0,
      format: 'date',
    },
    inStock: {
      title: 'In Stock',
      description: 'Indicates if the item is in stock.',
      type: 'boolean',
    },
  },
  required: ['id', 'name', 'price'],
  additionalProperties: false,
};

export default {
  title: 'SchemaBuilder',
  component: SchemaBuilder,
};

const PrimitivesTemplate: Story = (args) => (
  <SchemaProvider extraFields={args.extraFields || []} templates={[template]}>
    <SchemaBuilder {...args} />
  </SchemaProvider>
);

export const Primitives = PrimitivesTemplate.bind({});
Primitives.args = {};

export const Formats = PrimitivesTemplate.bind({});
Formats.args = {
  extraFields: [...STRING_WIDGETS],
};

const DefaultValueTemplate: Story = (args) => (
  <SchemaProvider value={sampleSchema} extraFields={args.extraFields || []}>
    <SchemaBuilder {...args} />
  </SchemaProvider>
);

export const WithDefaultValue = DefaultValueTemplate.bind({});
WithDefaultValue.args = {
  extraFields: [...STRING_WIDGETS],
};

const ThemedTemplate: Story = (args) => {
  const theme = createTheme(args.theme);
  return (
    <ThemeProvider theme={theme}>
      <SchemaProvider value={sampleSchema} extraFields={args.extraFields || []}>
        <SchemaBuilder {...args} />
      </SchemaProvider>
    </ThemeProvider>
  );
};

export const Themed = ThemedTemplate.bind({});
Themed.args = {
  extraFields: [...STRING_WIDGETS],
  theme: {
    palette: {
      primary: {
        main: '#ff5722',
      },
      mode: 'dark',
    },
    components: {
      MuiInput: {
        defaultProps: {
          size: 'small',
        },
      },
    },
  },
};

const customTemplate = {
  id: 'FAQ_TEMPLATE',
  title: 'FAQ Template',
  description: 'A template schema for FAQ type.',
  schema: {
    title: 'FAQ',
    type: 'array',
    items: {
      type: 'object',
      title: 'List of Questions',
      properties: {
        question: {
          title: 'question',
          type: 'string',
        },
        answer: {
          title: 'answer',
          type: 'string',
        },
      },
    },
    uniqueItems: true,
  },
};

const FaqTemplate: Story = (args) => (
  <SchemaProvider templates={[customTemplate]}>
    <SchemaBuilder {...args} />
  </SchemaProvider>
);

export const CustomTemplate = FaqTemplate.bind({});
