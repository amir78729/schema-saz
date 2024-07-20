import React, { useState } from 'react';
import { RJSFSchema } from '@rjsf/utils';
import AddFieldModal from './AddFieldModal';
import Numbers from '@mui/icons-material/Numbers';
import {
  Add,
  Checklist,
  DataArray,
  DataObject,
  Delete,
  Edit,
  ExpandLess,
  ExpandMore,
  Star,
  TextSnippet,
  ToggleOn,
  Visibility,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { accessToObjectFieldParentByPath, generatePath, getFieldId, getSchemaFormatFromSchema } from '../utils';
import { DataVisualizationType, JsonSchema } from '../types';
import { SchemaAction, useSchema } from '../providers/SchemaProvider';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import FieldPreview from './FieldPreview';

// TODO: refactor
const renderHeader = ({
  icon,
  schema,
  onDelete,
  name,
  path,
  description,
  isRequired,
}: {
  icon?: React.ReactElement;
  schema: RJSFSchema;
  description?: React.ReactNode;
  path: string;
  name?: string;
  onDelete?: () => void;
  collapse?: boolean;
  onCollapse?: () => void;
  isRequired?: boolean;
}) => {
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const { fields, dispatch } = useSchema();
  const SelectedFieldClass = fields.find((field) => field.id === getFieldId(schema))?.Class;

  let field;
  if (SelectedFieldClass && name) {
    field = new SelectedFieldClass(name);
  }
  return (
    <>
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)}>
        <DialogTitle>
          Edit <code>{name}</code> Field
        </DialogTitle>
        <DialogContent>
          <Form
            onSubmit={({ formData }) => {
              handleEdit(dispatch, path, formData);
              setShowEditModal(false);
            }}
            schema={field?.getBuilderSchema()}
            formData={schema}
            validator={validator}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewModal} onClose={() => setShowPreviewModal(false)}>
        <DialogTitle>
          <code>{name}</code> Field{' '}
          <span>
            {onDelete && (
              <IconButton color="error" onClick={() => setShowDeleteConfirmationModal(true)}>
                <Delete fontSize="small" />
              </IconButton>
            )}
            <IconButton color="warning" onClick={() => setShowEditModal(true)}>
              <Edit fontSize="small" />
            </IconButton>
          </span>
        </DialogTitle>
        <DialogContent>
          <FieldPreview name={name || ''} schema={field?.getBuilderSchema()} data={schema} />
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirmationModal} onClose={() => setShowDeleteConfirmationModal(false)}>
        <DialogContent>
          <Typography>Are you sure you want to delete this field?</Typography>
        </DialogContent>
        <DialogActions>
          <Button fullWidth color="error" onClick={() => setShowDeleteConfirmationModal(false)}>
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={() => {
              onDelete?.();
              setShowDeleteConfirmationModal(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <ListItem>
        <ListItemText
          primary={
            <>
              <Typography variant="h6">
                {schema?.title}{' '}
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={icon}
                  label={`${schema?.type}${schema?.format ? `: ${schema?.format}` : ''}`}
                />{' '}
                {isRequired && <Chip size="small" color="error" variant="outlined" icon={<Star />} label={'Required'} />}
              </Typography>
              {description && <Typography variant="caption">{description}</Typography>}
            </>
          }
        />
        {onDelete && (
          <IconButton color="error" onClick={() => setShowDeleteConfirmationModal(true)}>
            <Delete fontSize="small" />
          </IconButton>
        )}
        <IconButton color="warning" onClick={() => setShowEditModal(true)}>
          <Edit fontSize="small" />
        </IconButton>

        <IconButton color="info" onClick={() => setShowPreviewModal(true)}>
          <Visibility fontSize="small" />
        </IconButton>
      </ListItem>
    </>
  );
};

const handleDelete = (dispatch: React.Dispatch<SchemaAction>, name: string) => {
  dispatch({ type: 'DELETE_PROPERTY', payload: { name } });
  dispatch({ type: 'DELETE_REQUIRED', payload: { name } });
};

const handleEdit = (dispatch: React.Dispatch<SchemaAction>, name: string, schema: RJSFSchema) => {
  dispatch({ type: 'UPDATE_PROPERTY', payload: { name, schema } });
};

const isPropertyRequired = (fullSchema: JsonSchema, path: string, name: string) =>
  (accessToObjectFieldParentByPath(fullSchema, path) as JsonSchema)?.required?.includes?.(name as string);

const SchemaPreview = ({ schema, data, name, path }: DataVisualizationType) => {
  const FormPreview = getSchemaFormatFromSchema(schema, SchemaPreview);
  return <FormPreview {...{ schema, data, name, path }} />;
};

SchemaPreview.String = function String({ schema, path, name }: DataVisualizationType<string>) {
  const { dispatch, schema: fullSchema } = useSchema();

  return (
    <Paper>
      {renderHeader({
        description: schema.description,
        name,
        path,
        schema,
        icon: <TextSnippet />,
        onDelete: () => handleDelete(dispatch, path),
        isRequired: isPropertyRequired(fullSchema, path, name),
      })}
    </Paper>
  );
};

SchemaPreview.Enum = function Enum({ schema, path, name }: DataVisualizationType) {
  const { dispatch, schema: fullSchema } = useSchema();
  const enums = schema.enum;
  return (
    <Paper>
      {renderHeader({
        description: (
          <>
            {schema.description} <Typography variant="caption">Options:</Typography>{' '}
            <Box gap={1} display="flex" flexDirection="row">
              {enums.map((e: unknown, index: number) => (
                <Chip key={(e as string) + index} size="small" label={schema?.enumNames[enums.indexOf(e)] || e} />
              ))}
            </Box>
          </>
        ),
        name,
        path,
        schema,
        icon: <Checklist />,
        onDelete: () => handleDelete(dispatch, path),
        isRequired: isPropertyRequired(fullSchema, path, name),
      })}
    </Paper>
  );
};

SchemaPreview.Number = function Number({ schema, path, name }: DataVisualizationType<number>) {
  const { dispatch, schema: fullSchema } = useSchema();
  return (
    <Paper>
      {renderHeader({
        description: schema.description,
        name,
        path,
        schema,
        icon: <Numbers />,
        onDelete: () => handleDelete(dispatch, path),
        isRequired: isPropertyRequired(fullSchema, path, name),
      })}
    </Paper>
  );
};

SchemaPreview.Integer = function Number({ schema, path, name }: DataVisualizationType<number>) {
  const { dispatch, schema: fullSchema } = useSchema();
  return (
    <Paper>
      {renderHeader({
        description: schema.description,
        name,
        path,
        schema,
        icon: <Numbers />,
        onDelete: () => handleDelete(dispatch, path),
        isRequired: isPropertyRequired(fullSchema, path, name),
      })}
    </Paper>
  );
};

SchemaPreview.Boolean = function BooleanVisualization({ schema, path, name }: DataVisualizationType<boolean>) {
  const { dispatch, schema: fullSchema } = useSchema();
  return (
    <Paper>
      {renderHeader({
        description: schema.description,
        name,
        path,
        schema,
        icon: <ToggleOn />,
        onDelete: () => handleDelete(dispatch, path),
        isRequired: isPropertyRequired(fullSchema, path, name),
      })}
    </Paper>
  );
};

SchemaPreview.Object = function ObjectVisualization({
  schema,
  path,
  name,
  data,
}: DataVisualizationType<Record<string, unknown>>) {
  const { dispatch, schema: fullSchema } = useSchema();
  const properties = Object.keys(schema?.properties || {});

  const [open, setOpen] = React.useState(true);

  const handleCollapse = () => {
    setOpen(!open);
  };

  return (
    <Paper>
      {renderHeader({
        description: schema.description,
        name,
        path,
        schema,
        icon: <DataObject />,
        collapse: open,
        onCollapse: handleCollapse,
        onDelete: () => handleDelete(dispatch, path),
        isRequired: isPropertyRequired(fullSchema, path, name),
      })}
      <Paper sx={{ p: 1 }}>
        <Box px={2} display="flex" justifyContent="space-between">
          <Typography flex={1}>Properties</Typography>
          <AddFieldModal parentPath={generatePath(path, 'properties')} />
          {open !== undefined && (
            <IconButton onClick={handleCollapse}>
              {!open ? <ExpandMore fontSize="small" /> : <ExpandLess fontSize="small" />}
            </IconButton>
          )}
        </Box>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Stack gap={2}>
            {properties?.length > 0 ? (
              properties?.map((property) => (
                <>
                  <SchemaPreview
                    data={data}
                    name={property}
                    schema={schema.properties[property]}
                    path={generatePath(path, generatePath('properties', property))}
                  />
                </>
              ))
            ) : (
              <Typography alignItems="center" textAlign="center" p={3}>
                Click on <Add fontSize="small" /> button to add properties
              </Typography>
            )}
          </Stack>
        </Collapse>
      </Paper>
    </Paper>
  );
};

SchemaPreview.Array = function ArrayVisualization({ schema, path, name, data }: DataVisualizationType<unknown[]>) {
  const { dispatch, schema: fullSchema } = useSchema();
  return (
    <Paper sx={{ p: 1 }}>
      {renderHeader({
        description: schema.description,
        name,
        path,
        schema,
        icon: <DataArray />,
        onDelete: () => handleDelete(dispatch, path),
        isRequired: isPropertyRequired(fullSchema, path, name),
      })}
      <Box>
        <SchemaPreview {...{ data, schema: schema.items, name, path: generatePath(path, 'items') }} />
      </Box>
    </Paper>
  );
};

SchemaPreview.Unknown = function UnknownVisualization() {
  return <></>;
};

export default SchemaPreview;
