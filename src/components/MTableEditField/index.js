import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import CircularProgress from '@material-ui/core/CircularProgress';
import withTheme from '@material-ui/core/styles/withTheme';

function MTableEditCell(props) {
  const [state, setState] = React.useState(() => ({
    isLoading: false,
    value: props.rowData[props.columnDef.field]
  }));

  const getStyle = () => {
    let cellStyle = {
      boxShadow: '2px 0px 15px rgba(125,147,178,.25)',
      color: 'inherit',
      width: props.columnDef.tableData.width,
      boxSizing: 'border-box',
      fontSize: 'inherit',
      fontFamily: 'inherit',
      fontWeight: 'inherit',
      padding: '0 16px'
    };

    if (typeof props.columnDef.cellStyle === 'function') {
      cellStyle = {
        ...cellStyle,
        ...props.columnDef.cellStyle(state.value, props.rowData)
      };
    } else {
      cellStyle = { ...cellStyle, ...props.columnDef.cellStyle };
    }

    if (typeof props.cellEditable.cellStyle === 'function') {
      cellStyle = {
        ...cellStyle,
        ...props.cellEditable.cellStyle(
          state.value,
          props.rowData,
          props.columnDef
        )
      };
    } else {
      cellStyle = { ...cellStyle, ...props.cellEditable.cellStyle };
    }

    return cellStyle;
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      onApprove();
    } else if (e.keyCode === 27) {
      onCancel();
    }
  };

  const onApprove = () => {
    setState({ ...state, isLoading: true }, () => {
      props.cellEditable
        .onCellEditApproved(
          state.value, // newValue
          props.rowData[props.columnDef.field], // oldValue
          props.rowData, // rowData with old value
          props.columnDef // columnDef
        )
        .then(() => {
          setState({ ...state, isLoading: false });
          props.onCellEditFinished(props.rowData, props.columnDef);
        })
        .catch((error) => {
          // might be wrong
          setState({ ...state, isLoading: false, error });
        });
    });
  };

  const onCancel = () => {
    props.onCellEditFinished(props.rowData, props.columnDef);
  };

  return (
    <TableCell size={props.size} style={getStyle()} padding="none">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1, marginRight: 4 }}>
          <props.components.EditField
            columnDef={props.columnDef}
            value={state.value}
            onChange={(value) => setState({ value })}
            onKeyDown={handleKeyDown}
            disabled={state.isLoading}
            rowData={props.rowData}
            autoFocus
          />
        </div>
        {state.isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', width: 60 }}>
            <CircularProgress size={20} />
          </div>
        )}
      </div>
    </TableCell>
  );
}

MTableEditCell.defaultProps = {
  columnDef: {},
  localization: {
    saveTooltip: 'Save',
    cancelTooltip: 'Cancel'
  }
};

MTableEditCell.propTypes = {
  cellEditable: PropTypes.object.isRequired,
  columnDef: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  errorState: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  icons: PropTypes.object.isRequired,
  localization: PropTypes.object.isRequired,
  onCellEditFinished: PropTypes.func.isRequired,
  rowData: PropTypes.object.isRequired,
  size: PropTypes.string
};

export default withTheme(MTableEditCell);
