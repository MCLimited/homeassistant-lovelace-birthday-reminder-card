class BirthdayCard extends HTMLElement {
	set hass(hass) {
		
        var bdTextToday = "Vandaag"; // Today
        var bdTextTomorrow = "Morgen"; // Tomorrow
        var bdTextNone = "Geen verjaardagen in de komende"; // No birthdays during next
        var bdTextDays = "dagen"; // days
        var bdTextYears = "jaar"; // years
        var bdTextIn = ""; // in
        
        var bdDeadSymbol = "&#8224;"; // (Symbol for people who have passed on - set «, d:1» in birthday list)
        var bdMarriedSymbol = "&#9829;";
        
        
        
		var birthdayList=[
			{name:"Adam", day:17, month:2, year:1990},
			{name:"Amanda", day:2, month:3, year:1967},
			{name:"Grandfather", day:16, month:2, year:1927, s:1},
			{name:"Gladys", day:10, month:2, year:1967},
			{name:"Peter", day:7, month:3, year:1967},
			{name:"Wedding aniversary", day:5, month:3, year:2003, s:2},
		];
        
		
		if (!this.content) {
			const card = document.createElement('ha-card');
			var tittel = this.config.title;
			card.header = tittel ? tittel : "Birthdays"; // Card title from ui-lovelace.yaml - Defaults to Birthdays
			this.content = document.createElement('div');
			this.content.style.padding = '0 16px 16px';
			card.appendChild(this.content);
			this.appendChild(card);
		}
        
		const entityId = this.config.entity;
		const state = hass.states[entityId];
		const stateStr = state ? state.state : 'unavailable';

		
        var today = new Date();
        var currentMonth = today.getMonth() + 1; // Months are zero-based
        var currentDay = today.getDate();
        var currentYear = today.getFullYear();
        
        // Calculate the upcoming birthdays
        var upcomingBirthdays = birthdayList.map(function(birthday) {
          var birthdayDate = new Date(today.getFullYear(), birthday.month - 1, birthday.day);
        
          // Check if the birthday has already occurred this year
          if (
            birthdayDate.getMonth() < currentMonth ||
            (birthdayDate.getMonth() === currentMonth && birthdayDate.getDate() < currentDay)
          ) {
            // Set the birthday for next year
            birthdayDate.setFullYear(today.getFullYear() + 1);
          }
        
          return {
            ...birthday,
            date: birthdayDate
          };
        });
        
        // Sort the upcoming birthdays by month and day
        upcomingBirthdays.sort(function(a, b) {
          var aDate = new Date(today.getFullYear(), a.month - 1, a.day);
          var bDate = new Date(today.getFullYear(), b.month - 1, b.day);
        
          return aDate - bDate;
        });
        
        // Filter the upcoming birthdays starting from today and limit to the first two
        var sortedAndLimited = upcomingBirthdays.filter(function(birthday) {
          return (
            (birthday.month > currentMonth || (birthday.month === currentMonth && birthday.day >= currentDay))
          );
        }).slice(0, 8);
        
        // TEMPORARY
        
        var birthdayToday = "";
        var birthdayNext = "";
        
        // Process the sorted upcoming birthdays
        for (var i = 0; i < sortedAndLimited.length; i++) {
          var obj = sortedAndLimited[i];
        
          if (obj.year > 0) {
            var age = "(" + (currentYear - obj.year) + " " + bdTextYears + ")";
          } else {
            var age = "";
          }
        
          var bdSymbol = "";
          if (obj.s === 1) {
            bdSymbol = " " + bdDeadSymbol;
          }
          if (obj.s === 2) {
            bdSymbol = " " + bdMarriedSymbol;
          }
        
          if (obj.month === currentMonth && obj.day === currentDay) {
            birthdayToday += "<div class='bd-wrapper bd-today'><ha-icon class='ha-icon entity on' icon='mdi:crown'></ha-icon><div class='bd-name'>" + obj.name + " " + age + bdSymbol + "</div><div class='bd-when'>" + bdTextToday + "</div></div>";
          } else if (obj.ts !== 0) {
            var todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            var birthdayDate = new Date(today.getFullYear(), obj.month - 1, obj.day);
            var timeDiff = birthdayDate.getTime() - todayDate.getTime();
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
            var dbExpr = diffDays === 1 ? bdTextTomorrow : bdTextIn + " " + diffDays + " " + bdTextDays;
          
            birthdayNext += "<div class='bd-wrapper'><ha-icon class='ha-icon entity' icon='mdi:calendar-clock'></ha-icon><div class='bd-name'>" + obj.name + " " + age + bdSymbol + "</div><div class='bd-when'>" + dbExpr + " (" + obj.day + "." + obj.month + ")</div></div>";
          }
        }

		var cardHtmlStyle = `
		<style>
			.bd-wrapper {
				padding: 5px;
				margin-bottom: 5px;
			}
			.bd-wrapper:last-child {
				OFFborder-bottom: none;
			}
			.bd-divider {
				height: 1px;
				border-bottom: 1px solid rgba(127, 127, 127, 0.7);
				margin-bottom: 5px;
			}
			.bd-today {
				font-weight: bold;
				OFFborder-bottom: 1px solid;
			}
			.bd-wrapper .ha-icon {
				display: inline-block;
				height: 20px;
				width: 20px;
				margin-left: 5px;
				margin-right: 17px;
				color: var(--paper-item-icon-color);
			}
			.bd-wrapper .ha-icon.on {
				margin-left: 5px;
				margin-right: 17px;
				color: var(--paper-item-icon-active-color);
			}
			.bd-name {
				display: inline-block;
				padding-left: 10px;
				padding-top: 2px;
			}
			.bd-none {
				color: var(--paper-item-icon-color);
			}
			.bd-when {
				display: inline-block;
				float: right;
				font-size: smaller;
				padding-top: 3px;
			}
		</style>
		`;
		
		if (!birthdayToday && !birthdayNext) {
			var cardHtmlContent = "<div class='bd-none'>" + bdTextNone + " " + numberOfDays + " " + bdTextDays + "</div>";
		} else if (!birthdayToday) {
			var cardHtmlContent = birthdayNext;
		} else if (!birthdayNext) {
			var cardHtmlContent = birthdayToday;
		} else {
			var cardHtmlContent = birthdayToday + "<div class='bd-divider'></div>" + birthdayNext;
		}
		
		this.content.innerHTML = cardHtmlStyle + cardHtmlContent;
		
	}
	
	
	
	setConfig(config) {
		this.config = config;
	}
	
// The height of your card. Home Assistant uses this to automatically distribute all cards over the available columns.
}

customElements.define('birthday-card', BirthdayCard);
