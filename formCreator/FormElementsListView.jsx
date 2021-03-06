import React from 'react';
import ReactDOM from 'react-dom';
import {AgGridReact} from 'ag-grid-react';
import '../assets/styles/ag-grid.css';
import '../assets/styles/theme-bootstrap.css';
import '../assets/styles/theme-fresh.css';
import 'babel-polyfill';
import update from 'immutability-helper';
import { Row,Button ,Col} from 'react-bootstrap';
import FormPreview from '../formpreview/FormPreview.jsx';
import FormReOrderView from '../formElementsReorder/FormReOrderView.jsx';
import FormElementDeleteRenderer from './FormElementDeleteRenderer.jsx';

class FormElementsListView extends React.Component {

   

   constructor(props)
	{
		super(props)
		this.state = {gridData:[],isDelete:false}
	}


   addElement(formElement)
   {
   		this.formElementGrid.api.collapseAll();
   		 var groupData = false
   		 var groupDataMatched = false
   		 var rows = this.formElementGrid.api.getModel();
		if(formElement.fieldGrouping.length > 0)
		{	
			
			groupData = true
			for(var g = 0;g < rows.rowsToDisplay.length;g++)
			{
				if(rows.rowsToDisplay[g].data.fieldGrouping == formElement.fieldGrouping )
				{	
					groupDataMatched = true					
					rows.rowsToDisplay[g].data.children.push({fieldId:rows.rowsToDisplay[g].data.fieldId+'-'+rows.rowsToDisplay[g].data.children.length,fieldName:formElement.fieldName,fieldType:'Radio',leaf:true,fieldGrouping:formElement.fieldGrouping})
					
				}
			}
			
		}
		else
		{	
			rows.rowsToDisplay.push({data:{fieldId:rows.rowsToDisplay.length,fieldName:formElement.fieldName,fieldType:formElement.fieldType}})
		}

		if(groupData && !groupDataMatched)
		{
			formElement.group = true;
			formElement.children = [];
			rows.rowsToDisplay.push({data:{fieldId:rows.rowsToDisplay.length,group:true,children:[],fieldGrouping:formElement.fieldGrouping,fieldName:formElement.fieldName}})
		}

		
		var newArray = this.pluck(rows.rowsToDisplay,'data')	
		
		//UPDATE STATE AS WELL		
		this.setState({gridData:newArray}); 
		
   	
   }

	headerCellRendererFunc(params) 
	{
		var eHeader = "<span style = 'font-weight:bold;'>"+params.colDef.headerName+"</span>"
		return eHeader;
	}

	launchFormPreview()
	{
		var formElementsData = this.pluck(this.formElementGrid.api.getModel().rowsToDisplay,'data')
		this.formPreview.showPreview(formElementsData)
	}

	launchFormReOrderView()
	{
		var formElementsData = this.pluck(this.formElementGrid.api.getModel().rowsToDisplay,'data')
		this.formReOrderView.showListOrder(formElementsData)
	}

	pluck(array, key) 
	{
		var newArray = [];
		for(var a = 0 ;a < array.length ;a ++)
		{
			if(!array[a][key].leaf)
			{
				newArray.push(array[a][key])
			}
		}

	   return newArray;
	}

	innerCellRenderer(params) 
	{
        return params.data.fieldName;
    }

    itemSelectionChange()
    {	
    	if(!this.state.isDelete)
    	{
    		this.props.editFormElement(this.formElementGrid.api.getSelectedRows()[0])
    	}
    	else
    	{
    		this.setState({isDelete:false})
    	}
    	
    	
    }

    updateFormElement(formElement)
   	{
   		var gridArray = this.formElementGrid.api.getModel().rowsToDisplay;  
     	gridArray = this.pluck(gridArray,'data')
     	     	
     	gridArray.every(function(node,index){

     		if(node.children && node.children.length >0)
     		{
     			node.children.every(function(childNode,childIndex)
     			{

     				if(formElement.fieldId == childNode.fieldId)
     				{	
     					node.children[childIndex].fieldName = formElement.fieldName;     					
     					return false
     				}

     				return true		
     			})
     		}
     		
     		if(formElement.fieldId == node.fieldId )
     		{
     			gridArray[index].fieldName = formElement.fieldName
     			gridArray[index].fieldType = formElement.fieldType; 
     			return false
     			
     		}

     		return true

     	});    
		
		this.formElementGrid.api.setRowData([])
		this.setState({gridData:gridArray}); 
		this.formElementGrid.api.setRowData(this.state.gridData)
     	
   	}

    deleteFormItem(params)
    {
     	var gridArray = this.formElementGrid.api.getModel().rowsToDisplay;  
     	gridArray = this.pluck(gridArray,'data')
     	     	
     	gridArray.every(function(node,index){

     		if(node.children && node.children.length >0)
     		{
     			node.children.every(function(childNode,childIndex)
     			{

     				if(params.data.fieldId == childNode.fieldId)
     				{	
     					node.children.splice(childIndex,1)
     					return false
     				}

     				return true		
     			})
     		}
     		
     		if(params.data.fieldId == node.fieldId )
     		{
     			gridArray.splice(index,1)
     			return false
     			
     		}

     		return true

     	});    
		
		this.formElementGrid.api.setRowData([])
		this.setState({gridData:gridArray}); 
		this.formElementGrid.api.setRowData(this.state.gridData)
     	this.props.clearFormSelection();
     }
     

     componentDidMount() 
     {     
      this.formElementGrid.api.addEventListener('deleteFormItem',this.deleteFormItem.bind(this))
   	 }

   	 shouldComponentUpdate(nextProps,nextState)
   	 {	
   	 	if(nextState.isDelete != this.state.isDelete)
   	 	{	
   	 		return false
   	 	}
   	 	else
   	 	{
   	 		return true
   	 	}
   	 }


   	 cellSelected(cellParams)
   	 {
   	 	if(cellParams.colDef.headerName == "Delete")
   	 	{
   	 		
   	 		this.setState({isDelete:true})
   	 	}
   	 }

   	 reOrderFormElements(formElements)
   	 {
   	 	this.formElementGrid.api.setRowData([])
		this.setState({gridData:formElements}); 
		this.formElementGrid.api.setRowData(this.state.gridData)
   	 }


  	render (){

  		var columns = [{headerName:'Field Name',field:'fieldName', cellRendererParams: {
			                innerRenderer: this.innerCellRenderer.bind(this)
			            },cellClass: 'agGridCellWidth',cellRenderer: 'group'},
			            {headerName:'Field Type',field:'fieldType',cellClass: 'agGridCellWidth'},  						
  						{headerName:'Radio Field Grouping',field:'fieldGrouping',cellClass: 'agGridCellWidth'},
  						{headerName:'Delete',field:'testr',cellClass: 'agGridCellWidth',
  						  cellRenderer:function(params)
						  {	
								 	
							 var eParentElement = params.eParentOfValue;						 
							 ReactDOM.render(<FormElementDeleteRenderer gridParams ={params}/>, eParentElement);
							
							 params.addRenderedRowListener('renderedRowRemoved', () => {
								            ReactDOM.unmountComponentAtNode(eParentElement);
								        });						
							return null
						}
}]
   		
  

  		return (

			<div className="ag-fresh" style = {{width:"56.4%",height:"250px"}}>
				<AgGridReact
				    // column definitions and row data are immutable, the grid
				    // will update when these lists change
				    columnDefs={columns}
				    rowData={this.state.gridData}
				    headerCellRenderer = {this.headerCellRendererFunc.bind(this)}
				    ref={(grid) => this.formElementGrid = grid}
				    rememberGroupStateWhenNewData="true"
				    onSelectionChanged =  {this.itemSelectionChange.bind(this)}
				    onCellClicked = {this.cellSelected.bind(this)}
				    // or provide props the old way with no binding
				    rowSelection="multiple"
				    enableSorting="true"
				    enableFilter="true"
				    rowHeight="36"
				    style = {{width:"100%",height:"220px"}}
				    getNodeChildDetails = {function(element) {
												            if (element.group && element.children && element.children.length >0) {
												                return {
												                    group: true,
												                    children: element.children,
												                    expanded: element.open
												                };
												            } else {
												                return null;
												            }
											        }}
			       
				/>

				<div className="row defaultOverride" style = {{marginTop:'5px'}}>
					<div className = "col-*-*">
						<Button type ="button" style = {{marginRight:'5px'}} onClick ={this.launchFormReOrderView.bind(this)}>
						      Re-Order
					   </Button>
					   <Button type ="button" onClick ={this.launchFormPreview.bind(this)}>
						      Preview
					  </Button>
					 </div>
				</div>
				 
				<FormPreview  ref={(form) => this.formPreview = form} style = {{width:"75%"}}/>
				<FormReOrderView  ref={(form) => this.formReOrderView = form}  updateSorting= {this.reOrderFormElements.bind(this)}/>
			</div>	
		)

  	}

}

FormElementsListView.propTypes = {
	addElement:React.PropTypes.func,
	editFormElement:React.PropTypes.func,
	updateFormElement:React.PropTypes.func,
	clearFormSelection:React.PropTypes.func
}


export default FormElementsListView;