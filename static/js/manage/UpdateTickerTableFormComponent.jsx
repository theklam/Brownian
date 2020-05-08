import React from "react";
import { Form, Col, Button, Dropdown, DropdownButton} from 'react-bootstrap';
import '../../css/manage.css'

export default class UpdateTickerTableForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ticker: '',
            quantity: ''
        };
        this.postNewStock = this.postNewStock.bind(this);
        this.handleChangeTicker = this.handleChangeTicker.bind(this);
        this.handleChangeQuantity = this.handleChangeQuantity.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    handleChangeTicker(event) {
        this.setState({ ticker: event.target.value });
    }

    handleChangeQuantity(event) {
        this.setState({ quantity: event.target.value });
    }

    // this function gets called when we try to add a new stonk
    postNewStock() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker: this.state.ticker, quantity: this.state.quantity, userID: window.localStorage.getItem('userID'), method: 'store'})
        };
        fetch('/holdings', requestOptions)
            .then(res => res.text())
            .then(response => {
                // this is the response if we don't have a price for the stock we want to add
                // if we dont have a price for the stock we want to add, then we want to
                // get a price for the stock we want to add. 
                // if (response == 'Update Price') {
                //     console.log('Call a function to update prices for ' + this.state.ticker);
                //     this.props.fetchPrices([this.state.ticker]);
                // }
                // else {
                //     this.props.fetchCurrentHoldings();
                // }
                this.props.fetchCurrentHoldings();
            });
    }

    undoHoldings(timeFrame){
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({userID: window.localStorage.getItem('userID'), timeFrame: timeFrame})
        };
        fetch('/undoPortfolioChanges', requestOptions)
            .then(response => response.text())
            .then(response => {
                console.log(response)
                this.props.fetchCurrentHoldings();
            });
    }

    handleSelect(eventKey){
        this.undoHoldings(eventKey)
    }

    render() {
        return (
            <Form>
                <Form.Row className = 'updateForm'>
                    <Form.Group controlId="main" className='updateForm__group'>
                        <Form.Label className='updateForm__label text-muted'>Ticker</Form.Label>
                        <Form.Control type='text' placeholder="e.g. GOOG" onChange={this.handleChangeTicker} />
                    </Form.Group>
                    <Form.Group controlId="quantityField" className='updateForm__group'>
                        <Form.Label className='updateForm__label text-muted'>Quantity</Form.Label>
                        <Form.Control type='text' placeholder="e.g. 2" onChange={this.handleChangeQuantity} />
                    </Form.Group>
                    <div>
                        <Button className="manageButton" variant="primary" onClick={this.postNewStock}>
                            Add Stonk
                        </Button>
                    </div>
                    <DropdownButton className="manageButtonDiv" id="dropdown-basic-button" title="Undo Changes">
                        <Dropdown.Item eventKey="last_change" onSelect={this.handleSelect}>Undo Last Change</Dropdown.Item>
                        <Dropdown.Item eventKey="last_hour" onSelect={this.handleSelect}>Undo Last Hour</Dropdown.Item>
                        <Dropdown.Item eventKey="today" onSelect={this.handleSelect}>Undo Today</Dropdown.Item>
                    </DropdownButton>
                    
                </Form.Row>
            </Form>
        );
    }
}