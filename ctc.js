// JavaScript Document

var parms_2014 = {
	agiThreshold:   {
		mfj:    110000,
		hoh:    75000
	},
	earnedIncomeThreshold:  3000,
	taxBrackets: {
		mfj:	[0, 18150, 73800, 148850, 226850, 405100, 457600],
		hoh:	[0, 12950, 49400, 127550, 206660, 405100, 432200]
	},
	taxRates: [0.1, 0.15, 0.25, 0.28, 0.33, 0.35, 0.396],
	personalExemption: 3950,
	standardDeduction: {
		mfj: 12400,
		hoh: 9100
	}
};

var CBPP_childTaxCreditCalculator = function (p) {
    "use strict";
	var c = this;
	
	c.calculateTax = function (i) {
		var taxableIncome, exemptions, tax, currentBracket, brackets, incomeInBracket, oTaxableIncome;
		
		exemptions = i.dependents + (i.filingStatus === "mfj" ? 2 : 1);
		taxableIncome = Math.max(0, i.agi - p.standardDeduction[i.filingStatus] - p.personalExemption * exemptions);
		tax = 0;
		currentBracket = 0;
		brackets = p.taxBrackets[i.filingStatus];
		while (taxableIncome > 0) {
			if (typeof (brackets[currentBracket + 1]) === "undefined") {
				/*top bracket*/
				incomeInBracket = taxableIncome;
			} else {
				/*other brackets*/
				incomeInBracket = Math.min(brackets[currentBracket + 1] - brackets[currentBracket], taxableIncome);
			}
			tax += incomeInBracket * p.taxRates[currentBracket];
			taxableIncome -= incomeInBracket;
			currentBracket += 1;
		}
		return tax;
	};
	
	c.calculateCTC = function (i) {
        var agiOverThreshold, creditPhaseout, totalAvailableCredit,
            nonrefundablePortion, leftoverCredit, earnedIncomeOverThreshold,
            refundablePortion;
        
        /*Child Tax Credit Worksheet - Part 1*/
		agiOverThreshold = Math.floor(Math.max(0, i.agi - p.agiThreshold[i.filingStatus]) / 1000) * 1000;
		creditPhaseout = agiOverThreshold * 0.5;
        totalAvailableCredit = i.qualifyingChildren * 1000 - creditPhaseout;
		
        /*Child Tax Credit Worksheet - Part 2*/
        nonrefundablePortion = Math.min(totalAvailableCredit, i.tax);
        
        /*Schedule 8812 - Additional Child Tax Credit*/
        leftoverCredit = Math.max(0, totalAvailableCredit - nonrefundablePortion);
        earnedIncomeOverThreshold = Math.max(0, i.earnedIncome - p.earnedIncomeThreshold);
        refundablePortion = Math.min(earnedIncomeOverThreshold * 0.15, leftoverCredit);
        
        return {
            nonrefundable: nonrefundablePortion,
            refundable: refundablePortion
        };
        
	};
};

var calc2014 = new CBPP_childTaxCreditCalculator(parms_2014);

