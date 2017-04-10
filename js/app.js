$(function () {
    var getEmployeesButton = $('#getJSON'),
        filteringOptions = $('#filter-by'),
        form = $('#formToFilterEmployees'),
        filterButton = $('#filter-button');
    
    getEmployeesButton.on('click', function(){
        $(this).addClass('hidden');
        getEmployees();
    });

    function getEmployees() {
        $.ajax({
            url: "js/sluzba.json",
            dataType: "text"
        }).done(function (response) {
            form.removeClass('hidden');
            var employees = $.parseJSON(response);

            insertDataIntoTable(employees);
            addFilteringOptions(employees);
            addEmployeesFunctions(employees);
            datepicker();
            selectFilter(employees);
        }).fail(function (error) {
            alert(error);
        })
    }
    function insertDataIntoTable(data) {
        $('table').remove(); // removes previous table with employees
        $('div.pager').remove();

        // crate new table
        var table = $('<table>'),
            headers = $('<thead>'),
            tableContent = $('<tbody>'),
            row = $('<tr>');

        form.after(table);
        table.append(headers).append(tableContent);

        $.each(data[0], function (key,value) {
            var header = $('<th>'),
                arrows = $('<div>', {class: "arrows"}),
                arrowUp = $('<div>').addClass('arrow-up'),
                arrowDown = $('<div>').addClass('arrow-down');

            arrows.append(arrowUp).append(arrowDown);
            headers.append(row);
            header.text(key).append(arrows);
            row.append(header);

            $('.arrow-up').on('click', function () {
                var valueToSort = $(this).parent().parent().text(); // takes key name from the header
                if ( valueToSort === "dateOfBirth") {
                    data.sort(sortUpDates(valueToSort));
                    insertDataIntoTable(data);
                } else {
                    data.sort(sortUpByValue(valueToSort));
                    insertDataIntoTable(data);
                }
            });
            $('.arrow-down').on('click', function () {
                var valueToSort = $(this).parent().parent().text();
                if ( valueToSort === "dateOfBirth") {
                    data.sort(sortDownDates(valueToSort));
                    insertDataIntoTable(data);
                } else {
                    data.sort(sortDownByValue(valueToSort));
                    insertDataIntoTable(data);
                }
            });
        });

        $.each(data, function (index, employee) { // creates table content
            var row = $('<tr>');
            $.each(employee, function (key, value) {
                var userData = $('<td>');
                tableContent.append(row);
                if (key === "dateOfBirth") {
                    var arr = value.split(' '),
                        date = arr[0].split('.'); // removes birth hour

                    for ( var i = 0; i < 2; i++) { // checks format date, if mont or day has 1 numbers adds 0 before
                        if (date[i].length < 2) {
                            date[i] = '0' + date[i];
                        }
                    }
                    userData.text(date[0] + '/' + date[1] + '/' + date[2]);
                } else {
                    userData.text(value);
                }
                row.append(userData);
            })
        });
        pagination();
    }

    //function for filtering
    function addFilteringOptions(data) {
        var newFilter = $('<option>');
        filteringOptions.append(newFilter.text('choose'));
        $.each(data[0], function( index, value) {
            var newFilter = $('<option>');
            filteringOptions.append(newFilter.text(index));
        });
    }
    function addEmployeesFunctions(data) {
        var employeesFunctions = $('#function');
        employeesFunctions.append($('<option>').text('choose'));
        var functions = [];
        $.each(data, function( index, employee) {
            if (functions.indexOf(employee.function) === -1 ) {
                functions.push(employee.function);
                employeesFunctions.append($('<option>').text(employee.function));
            }
        });
    }
    function datepicker() {
        var dateFormat = "dd/mm/yy",
            from = $("#from")
                .datepicker({
                    defaultDate: "+1w",
                    changeDay: true,
                    changeMonth: true,
                    changeYear: true,
                    numberOfMonths: 1,
                    dateFormat: "dd/mm/yy"
                })
                .on("change", function () {
                    to.datepicker("option", "minDate", getDate(this));
                }),
            to = $("#to").datepicker({
                defaultDate: "+1w",
                changeDay: true,
                changeMonth: true,
                changeYear: true,
                numberOfMonths: 1,
                dateFormat: "dd/mm/yy"
            })
                .on("change", function () {
                    from.datepicker("option", "maxDate", getDate(this));
                });

        function getDate(element) {
            var date;
            try {
                date = $.datepicker.parseDate(dateFormat, element.value);
            } catch (error) {
                date = null;
            }
            return date;
        }
    }
    function selectFilter(data) {
        filteringOptions.on('change', function (e) {
            filterButton.removeClass('hidden');
            var filteringInputs = $('.filtering-input'),
                chosenFilter = $(this).val();

            if (chosenFilter === 'choose' || chosenFilter === 'function') { // prevents showing filter button, before choosing filter
                filterButton.addClass('hidden');
            }
            $('#function').on('change',function () { // prevents showing filter button, before choosing  employee function
                if ($(this).val() === "choose") {
                    filterButton.addClass('hidden');
                    insertDataIntoTable(data);
                } else {
                    filterButton.removeClass('hidden');
                    insertDataIntoTable(data);
                }
            });
            filteringInputs.each(function (index, value) {
                if ($(this).hasClass(chosenFilter)) {
                    $(this).removeClass('hidden');
                    insertDataIntoTable(data);
                    var input = $(this).find('input'),
                        select = $(this).find('select');

                    filterButton.on('click', function (e) {
                        e.preventDefault();
                        var inputValue = input.val(),
                            selectValue = select.val();
                        if (chosenFilter === 'id') {
                            var idFiltered = data.filter(function (element) {
                                return element.id === parseInt(inputValue);
                            });
                            insertDataIntoTable(idFiltered);
                        } else if (chosenFilter === 'firstName') {
                            var nameFiltered = data.filter(function (element) {
                                return element.firstName.toLowerCase() === inputValue.toLowerCase();
                            });
                            insertDataIntoTable(nameFiltered);
                        } else if (chosenFilter === 'lastName') {
                            var lastNameFiltered = data.filter(function (element) {
                                return element.lastName.toLowerCase() === inputValue.toLowerCase();
                            });
                            insertDataIntoTable(lastNameFiltered);
                        } else if (chosenFilter === 'dateOfBirth') {
                            var dateFrom = new Date($('#from').val()),
                                dateTo = new Date($('#to').val());

                            var filteredDates = data.filter(function(element){
                                return parseDate(element.dateOfBirth) > dateFrom && parseDate(element.dateOfBirth) < dateTo;
                            });
                            insertDataIntoTable(filteredDates);
                        } else if (chosenFilter === 'function') {
                            var functionFiltered = data.filter(function (element) {
                                return element.function === selectValue;
                            });
                            insertDataIntoTable(functionFiltered);
                        } else if (chosenFilter === 'experience') {
                            var experienceFiltered = data.filter(function (element) {
                                return element.experience === parseInt(inputValue);
                            });
                            insertDataIntoTable(experienceFiltered);
                        }
                    });
                } else {
                    $(this).addClass('hidden');
                }
            });
        });
    }

    //function for sorting
    function sortDownByValue(key) {
        return function compare(a, b) {
            if (a[key] < b[key])
                return -1;
            if (a[key] > b[key])
                return 1;
            return 0;
        }
    }
    function sortUpByValue(key) {
        return function compare(a, b) {
            if (a[key] > b[key])
                return -1;
            if (a[key] < b[key])
                return 1;
            return 0;
        }
    }
    function parseDate(dateString){
        var dateParts = dateString.split(' '),
            dateArr = dateParts[0].split('.');

        return new Date(dateArr[2], dateArr[1]-1, dateArr[0]);
    }
    function sortUpDates(key) {
        return function compare(a, b) {
            if (parseDate(a[key]) > parseDate(b[key]))
                return -1;
            if (parseDate(a[key]) < parseDate(b[key]))
                return 1;
            return 0;
        }
    }
    function sortDownDates(key) {
        return function compare(a, b) {
            if (parseDate(a[key]) < parseDate(b[key]))
                return -1;
            if (parseDate(a[key]) > parseDate(b[key]))
                return 1;
            return 0;
        }
    }

    //pagination
    function pagination() {
        var currentPage = 0,
            numberPerPage = 5,
            table = $('table'),
            numberOfRows = table.find('tbody').find('tr').length;

        table.bind('repaginate', function () {
            table.find('tbody').find('tr').hide().slice(currentPage * numberPerPage, (currentPage + 1) * numberPerPage).show();
        });
        table.trigger('repaginate'); // paginates table, after loading page

        var pager = $('<div/>', {class: 'pager'}),
            numberOfPages = Math.ceil(numberOfRows / numberPerPage);

        table.after(pager);
        for (var page = 0; page < numberOfPages; page++) {
            $('<span/>', {class: 'page-number'}).text(page + 1).bind('click', {
                newPage: page
            }, function(event) {
                currentPage = event.data['newPage'];
                table.trigger('repaginate');
                $(this).addClass('active').siblings().removeClass('active');
            }).appendTo(pager);
            $('<span/>').appendTo(pager);
        }
        pager.find('span.page-number:first').addClass('active');
    }
});
