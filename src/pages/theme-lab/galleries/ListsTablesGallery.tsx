import { List } from '@ui5/webcomponents-react/List'
import { ListItemStandard } from '@ui5/webcomponents-react/ListItemStandard'
import { Table } from '@ui5/webcomponents-react/Table'
import { TableCell } from '@ui5/webcomponents-react/TableCell'
import { TableHeaderCell } from '@ui5/webcomponents-react/TableHeaderCell'
import { TableHeaderRow } from '@ui5/webcomponents-react/TableHeaderRow'
import { TableRow } from '@ui5/webcomponents-react/TableRow'
import { TableRowAction } from '@ui5/webcomponents-react/TableRowAction'
import { TableSelectionMulti } from '@ui5/webcomponents-react/TableSelectionMulti'
import { Tree } from '@ui5/webcomponents-react/Tree'
import { TreeItem } from '@ui5/webcomponents-react/TreeItem'
import { UploadCollection } from '@ui5/webcomponents-react/UploadCollection'
import { UploadCollectionItem } from '@ui5/webcomponents-react/UploadCollectionItem'
import { GalleryPanel } from '../GalleryPanel'

export function ListsTablesGallery() {
  return (
    <>
      <GalleryPanel title="List">
        <List selectionMode="Single">
          <ListItemStandard icon="employee" additionalText="Active">
            Markus Mettler
          </ListItemStandard>
          <ListItemStandard icon="employee" additionalText="Away" selected>
            Selected item
          </ListItemStandard>
          <ListItemStandard icon="employee" additionalText="Readonly">
            Another item
          </ListItemStandard>
        </List>
      </GalleryPanel>

      <GalleryPanel title="Table">
        <Table
          features={<TableSelectionMulti />}
          headerRow={
            <TableHeaderRow sticky>
              <TableHeaderCell minWidth="12rem">Name</TableHeaderCell>
              <TableHeaderCell minWidth="8rem">Role</TableHeaderCell>
              <TableHeaderCell minWidth="6rem">Status</TableHeaderCell>
            </TableHeaderRow>
          }
        >
          <TableRow
            rowKey="1"
            actions={
              <>
                <TableRowAction icon="edit" text="Edit" />
              </>
            }
          >
            <TableCell>Alice</TableCell>
            <TableCell>Manager</TableCell>
            <TableCell>Open</TableCell>
          </TableRow>
          <TableRow rowKey="2">
            <TableCell>Bob</TableCell>
            <TableCell>Employee</TableCell>
            <TableCell>Done</TableCell>
          </TableRow>
        </Table>
      </GalleryPanel>

      <GalleryPanel title="Tree">
        <Tree>
          <TreeItem text="Organisation" expanded>
            <TreeItem text="HR" />
            <TreeItem text="Finance" selected />
            <TreeItem text="IT" />
          </TreeItem>
          <TreeItem text="Projects">
            <TreeItem text="AWB" />
          </TreeItem>
        </Tree>
      </GalleryPanel>

      <GalleryPanel title="UploadCollection">
        <UploadCollection>
          <UploadCollectionItem
            fileName="antrag.pdf"
            fileNameClickable
            uploadState="Complete"
          />
          <UploadCollectionItem
            fileName="beleg.png"
            uploadState="Uploading"
            progress={45}
          />
          <UploadCollectionItem
            fileName="fehler.docx"
            uploadState="Error"
          />
        </UploadCollection>
      </GalleryPanel>
    </>
  )
}
