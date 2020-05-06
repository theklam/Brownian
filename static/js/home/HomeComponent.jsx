import React from "react";
import '../../css/home.css'
import brownianLogo from '../../css/brownian_logo.png'

export default class HomeComponent extends React.Component {
    render() {
        return (
        <div className="home">
            <div className="jumbotron jumbotron-fluid home__banner">
                <div className="imageWrapper">
                    <img src={brownianLogo} alt="Logo for Brownian"></img>
                </div>
            </div>
            <div className ='home__description'>
                <h1 className='home__description__header'>What is Brownian?</h1>
                <p className='home__description__text'>Brownian is a risk analysis tool that helps you manage a portfolio that fits your investment needs. You can test new strategies, optimize current allocations, and compare to the rest of the market.</p>
                <h1 className='home__description__header'>Why is it important to reduce risk</h1>
                <p className='home__description__text'>An asset’s risk is the uncertainty of its returns. Some assets, such as US Treasury Bonds, are almost guaranteed to pay out a certain amount of money. Other assets, such as junk bonds or emerging market ETFs, have a much higher probability of losing some, or even all of their value. Thinking in terms of risk-adjusted returns will help you get sufficient compensation for your risk.</p>
                <h1 className='home__description__header'>How to Use Brownian</h1>
                <p className='home__description__text'>1. When thinking about investing, you should first decide what your investment needs are. Think about the maximum risk you are willing to undertake, and the expected return you require.</p>
                <p className='home__description__text'>2. Once you have figured our your risk profile, you can get a template portfolio by inputting your constraints in the prediction tab. This portfolio will contain ETFs that represent all the major asset classes.</p>
                <p className='home__description__text'>3. After you have a template portfolio, you can pick specific stocks within each asset class with the recommendation tool.</p>
                <p className='home__description__text'>4. Once you have your complete portfolio, you can see analytics within the manage and visualize page and adjust as needed.</p>
                

            </div> 
        </div>
            
            
            // <h1>Home Page</h1>
        );
    }
}