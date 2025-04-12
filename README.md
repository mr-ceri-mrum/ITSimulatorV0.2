# IT Simulator V0.2

An economic strategy game where players build an IT company from scratch and compete with AI-driven market rivals.

## Game Description

IT Simulator is an economic strategy game where you create and develop your own IT company from scratch. Starting in 2004 with an initial capital of $1,000,000, your goal is to grow your startup into a tech giant by creating successful products, hiring talented employees, and making strategic business decisions.

The game simulates a realistic market environment with 300 competitive companies that evolve over time, creating a dynamic challenge that will test your business acumen and strategic thinking.

## Game Features

- **Start from scratch**: Found your company in 2004 with $1,000,000 initial capital
- **Strategic product development**: Choose from over 20 product types across different categories
- **Resource allocation**: Distribute development resources across backend, frontend, infrastructure, AI, and database
- **Company management**: Hire employees, add servers, and set marketing budgets
- **Dynamic market**: Compete with 300 AI-driven companies that develop their own products and acquire other companies
- **Economic simulation**: Experience realistic market trends, events, and company valuations
- **Acquisitions**: Grow your empire by acquiring competitor companies or individual products
- **Time controls**: Control game speed (1x, 2x, 4x) or pause anytime
- **Financial tracking**: Monitor your company's growth through detailed charts and statistics

## Game Categories

- Search Services (Search Engines, Maps, News Services)
- Media Platforms (Video, Music, Streaming Services)
- Social Networks (Social Networks, Professional Networks, Messaging, Dating)
- Operating Systems (Mobile OS, Desktop OS)
- Devices (Smartphones, Tablets, Laptops, Gaming Consoles, Wearables)
- Infrastructure (Cloud Platforms, Hosting, CDN)
- Commerce and Services (Ridesharing, E-commerce, Fintech, Food Delivery)
- Software (Office Suite, Antivirus, DBMS, Dev Tools, Enterprise Solutions)
- AI and Machine Learning (Chatbots, Computer Vision, Generative AI, Recommendation Systems)

## Game Economy

- **Revenue**: $12 per month per user
- **Employee Cost**: $25,000 per employee per month
- **Server Cost**: $10 per server (capable of supporting 100 users each)
- **Marketing**: Set custom budgets to grow your user base
- **Taxes**: 23% tax on profits
- **Product Quality**: Impacts user growth and retention
- **Market Events**: Random events can impact growth trends in different sectors

## Installation and Setup

1. Clone the repository:
```
git clone https://github.com/mr-ceri-mrum/ITSimulatorV0.2.git
```

2. Install dependencies:
```
cd ITSimulatorV0.2
npm install
```

3. Start the development server:
```
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Technologies Used

- React 18
- Redux (Redux Toolkit) for state management
- Material UI for the user interface
- Chart.js for data visualization
- Redux Persist for saving game progress

## Game Architecture

The game is built using a component-based architecture with Redux for state management:

- **Redux Store**: Manages game state, company data, market simulation, and product management
- **Game Engine**: Controls the game loop, updates, and time progression
- **Market Simulation**: Handles AI competitors, market trends, and events
- **Product System**: Manages product development, quality, and user growth

## Future Plans for V1.0

- Save/load game functionality
- Multiple difficulty levels
- More product categories and types
- Historical tech events integration
- Enhanced competitor AI
- Mobile support
- More detailed financial reporting
- Achievements system

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

GitHub: [@mr-ceri-mrum](https://github.com/mr-ceri-mrum)