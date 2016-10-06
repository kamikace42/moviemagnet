//TO DO
//          descripcion del torrent, info de la pagina
//          scroll top
//          check duplicates magnet http://jsfiddle.net/wke3Laej/
//          https://torrentproject.se/api
//          https://bitsnoop.com/info/api.html
//          https://zooqle.com/help/api.html
//          http://www.magnetdl.com/t/the-hobbit-2012/se/desc/
//          http://www.idope.se/torrent/Now You See Me 2 2016/
//          https://kickass.unblocked.live/search.php?q=the+matrix+1999
//          http://www.torrenthound.com/search/1/The+matrix+1999/seeds:desc
//          load more links
//          no links found- quitar tabla, ej The Scene
//          random movie http://codepen.io/yigitbiber/pen/JFpvc
//                      
//          popular movies https://torrentfreak.com/category/dvdrip/feed/
//          mejorar sistema actores/directores wiki? http://www.imdb.com/name/nm0000040/



jQuery(document).ready(function() {
    var imdb;
    var title;
    var year;
    var busqueda;
    var type;
    var randomTitle = "";
    searchEnter();
    autocompletar();
    getRandomMovie();



    //return
    function volver() {
        // $('section').hide("fold", { size: 65 }, 600, function() {
        $('.contenedor').hide("fade", function() {
            $('.landing').show();
            $("#buscar").focus();
            $("#buscar").val("");
            $('.info').empty();

        });


    }
    //click en la X
    $("#iconReturn").on('click', function() {
        volver();
    });
    //pulsar escape o retroceso
    $(document.body).on('keyup', function(event) {
        if (event.keyCode == 27) {
            volver();
        }
        if (event.keyCode == 8 && !$("#buscar").is(":focus")) {
            volver();
        }
    });

    //busqueda por enter
    function searchEnter() {
        $(document.body).on('keyup', function(event) {
            if (event.keyCode == 13) { // 13 = Enter Key
                $('#ui-id-1').hide();
                if ($('input').val() === "") {
                    $('.ui-autocomplete-loading').removeClass('ui-autocomplete-loading');
                    $('.info').empty();
                } else {
                    consulta();
                }
            }
        });
    }
    //boton buscar
    $("#btnBuscar").on('click', function() {
        if ($('input').val() !== "") {
            consulta();
        }

    });
    //boton random
    $("#btnRandom").on('click', function() {
        consulta('btnRandom');
    });
    $("#iconRandom").on('click', function() {
        consulta('iconRandom');
    });


    function getRandomMovie() {
        $.ajax({
                //url: 'http://www.imdb.com/random/title',
                url: 'ajaxproxy.php?http://www.suggestmemovie.com',
                type: 'GET',
                dataType: 'html',
            })
            .done(function(data) {
                var imagen = $(data).find('a img');
                //console.log($(asd[9]).attr('href'));
                console.log("random- " + imagen[3].title);
                randomTitle = imagen[3].title.replace(/[()]/g, '');//quitar parentesis año

            })
            .fail(function() {
                console.log("error");
            })
            .always(function() {
                console.log("complete");
            });
    }

    //mostrar servidores
    $(".logo img").on('click', function(event) {
        event.preventDefault();
        $(".servers,.mode").toggle();
    });


    //vaciar input
    /*$("#buscar").on('keyup change copy paste cut', function(e) {
        if (this.value.length === 0) {
            $('section').fadeOut('slow/400/fast', function() {
                $('section div').empty();
            });
            
        }
    });*/
    //ordenar y construir tabla
    function sortTable() {
        if ($('.seeders').length > 0) {
            $("table").tablesorter({
                sortList: [
                    [2, 1]
                ]
            });
        }
    }
    //reinicio tras busqueda
    function exit() {
        $('#ui-id-1').hide();
        $('.contenedor').fadeIn('slow');

        $('.loader').hide();
        sortTable();
        //auto scroll
        /*$('html, body').animate({
            scrollTop: $('#titulo').offset().top
        }, 0);*/
    }
    //sugerencias busqueda
    function autocompletar() {

        jQuery.ui.autocomplete.prototype._resizeMenu = function() {
            var ul = this.menu.element;
            ul.outerWidth(this.element.outerWidth());
        };
        $("#buscar").autocomplete({
            minLength: 2,
            delay: 200,
            select: function(event, ui) {
                event.preventDefault();
                $(this).val(ui.item.value);
                if (event.keyCode == 13) {
                    return;
                } else {
                    consulta();
                }
            },
            source: function(request, response) {
                $.ajax({
                    url: "ajaxproxy.php?http://www.imdb.com/xml/find?json=1&nr=1&tt=on",
                    type: 'GET',
                    dataType: "json",
                    data: {
                        q: request.term
                    },
                    success: function(data) {
                        var sugerencias = [];
                        var sugerenciasFiltro = [];
                        var descripcion;
                        var year;
                        if (!jQuery.isEmptyObject(data)) {
                            $.each(data, function(index, val) {
                                for (var i = 0; i < 10; i++) {
                                    if (val[i] && !val[i].description.match(/game/g)) {
                                        if (val[i].description.match(/\b(19|20)\d{2}\b/)) {
                                            year = val[i].description.match(/\b(19|20)\d{2}\b/);
                                            sugerencias.push(he.decode(val[i].title) + ' ' + year[0]);
                                        } else {
                                            sugerencias.push(he.decode(val[i].title));
                                        }
                                    }

                                }
                            });

                        } else {
                            sugerencias.push('Try again');
                        }

                        $.each(sugerencias, function(i, el) {
                            if ($.inArray(el, sugerenciasFiltro) === -1) sugerenciasFiltro.push(el);
                        });
                        response(sugerenciasFiltro);
                    }
                });
            }
        });
        //bloqueo checkbox
        $('input[type="checkbox"][name="servidor"]').on('change', function() {
            var getArrVal = $('input[type="checkbox"][name="servidor"]:checked').map(function() {
                return this.value;
            }).toArray();
            if (!getArrVal.length) {
                $(this).prop("checked", true);
                return false;
            }

        });

    }
    //trailer
    $(".trailer").fancybox();

    function trailer(title) {

        var video;
        jQuery.getJSON('https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyC8RTwNE44rIIa_it00jG_Q3J60A4UIP4I', {
            q: title + '+official+trailer'
        }, function(json, textStatus) {
            console.log(json);
            console.log(json.items[0].id.videoId);
            video = json.items[0].id.videoId;
            $("#descripcion").append('<a class="trailer fancybox.iframe" href="https://www.youtube.com/embed/' + video + '?autoplay=1&iv_load_policy=3" original-title="Watch trailer"><i class="fa fa-youtube-play fa-2x fa-fw" aria-hidden="true"></i><span>Trailer</span></a>');
        });

    }
    //nota imdb guay
    function imdbNota() {
        $("#nota").append('<span class="imdbRatingPlugin" data-user="ur68741226" data-title="' + imdb + ' data-style="p1"><a href="http://www.imdb.com/title/' + imdb + '"><img src="http://g-ecx.images-amazon.com/images/G/01/imdb/plugins/rating/images/imdb_46x22.png" alt="' + title + " " + year + ' on IMDb" /></a></span>');
        $.getScript('http://g-ec2.images-amazon.com/images/G/01/imdb/plugins/rating/js/rating.min.js');
        $.getScript('http://p.media-imdb.com/static-content/documents/v1/title/' + imdb + '/ratings%3Fjsonp=imdb.rating.run:imdb.api.title.ratings/data.json?u=ur64023610&s=p2');
    }



    //busqueda secundaria imdb, no usada
    function searchImdb() {
        jQuery.getJSON('miniProxy.php?http://www.imdb.com/xml/find?json=1&nr=1&tt=on&q=' + busqueda, function(json, textStatus) {
            if (!json.title_popular) {
                $('#titulo').append('<p>No results found</p>');
                exit();
                return;
            }
            imdb = json.title_popular[0].id;
            title = json.title_popular[0].title;
            $('#titulo').append('<p>' + json.title_popular[0].title + ' ' + json.title_popular[0].description + '</p>');
        });
    }
    // buscadores torrent
    //rarbg
    function searchRarbg() {
        if (document.getElementById('RARBG').checked) {
            //var url = 'http://torrentapi.org/pubapi_v2.php?mode=search&format=json_extended&sort=seeders&ranked=0&search_imdb=' + imdb + '&token=' + token;
            if (document.getElementById('expert').checked) {
                title = busqueda;
                year = "";
            }
            //token
            jQuery.ajax({
                    url: 'ajaxproxy.php?http://torrentapi.org/pubapi_v2.php?get_token=get_token',
                    type: 'GET',
                    dataType: 'json',
                })
                .done(function(json) {
                    console.log("success");
                    var token = json.token;
                    jQuery.ajax({
                            //url: 'http://torrentapi.org/pubapi_v2.php?mode=search&format=json_extended&sort=seeders&ranked=0&search_imdb=' + imdb + '&token=' + token,
                            url: 'ajaxproxy.php?http://torrentapi.org/pubapi_v2.php?mode=search&format=json_extended&sort=seeders&ranked=0&search_string=' + encodeURI(title) + '%20' + year + '&token=' + token + '&b=4&f=norefer',
                            type: 'GET',
                            dataType: 'json',
                        })
                        .done(function(json) {
                            console.log("success");
                            if (json.error === 'No results found' || json.error_code === 10) {
                                // $('#enlaces').append('<p>No results found in RARBG</p>');
                                console.log("No results found in RARBG");
                                //exit();
                                return;
                            } else if (json.error === 'Invalid token set!' || json.error === 'Invalid token. Use get_token for a new one!') {
                                console.log('invalid token');
                                token = "";
                                searchRarbg();
                                return;
                            } else {
                                for (var i in json.torrent_results) {
                                    var size = parseFloat(json.torrent_results[i].size / 1000000000).toFixed(2);
                                    $('tbody').append('<tr><td class="link"><a href=' + json.torrent_results[i].download + '>' + json.torrent_results[i].title + '</a></td><td class="size">' + ' ' + size + '  GiB ' + '</td><td class="seeders">' + ' ' + json.torrent_results[i].seeders + '</td><td class="leechers">' + ' ' + json.torrent_results[i].leechers + '</td></tr>');
                                }
                                $("table").trigger("update");
                                sortTable();
                            }
                        })
                        .fail(function(textContent) {
                            console.log("error");
                            console.log("rarbg " + textContent.statusText);
                        })
                        .always(function() {

                        });
                })
                .fail(function() {
                    console.log("error");
                })
                .always(function(json) {
                    console.log("complete");
                    console.log(json);
                });
        }
    }
    //piratebay
    function searchTpb() {
        if (document.getElementById('TPB').checked) {
            //arreglar error conexion, timeout?
            if (document.getElementById('expert').checked) {
                title = busqueda;
                year = "";

            }
            
            $.ajax({
                    //url: "ajaxproxy.php?url=https://thepiratebay.org/search/" + imdb,
                    url: "ajaxproxy.php?https://thepiratebay.org/search/" + encodeURI(title) + ' ' + year + "/0/99/200",
                    type: 'GET',
                    dataType: 'html',
                    timeout:5000,

                })

                .done(function(data) {
                    console.log("success");

                    if (!$(data).find('.detName')) {
                        // $('#enlaces').append('<p>No results found in thepiratebay</p>');
                        console.log('No results found in thepiratebay');

                        return;
                    }
                    /*else if (data.slice(0, 8) === 'Database') {
                        $('#enlaces').append('<p>thepiratebay database maintenance</p>');
                        return;
                    }*/
                    var magnet = $(data).find('.detName').next();
                    var detname = $(data).find('.detName');
                    var detLink = $(data).find('.detLink');
                    var detDesc = $(data).find('font.detDesc');
                    var tds = $(data).find("td[align='right']:even");
                    var tdl = $(data).find("td[align='right']:odd");

                    $(detLink).each(function(index, el) {
                        var title = $(this).text();
                        var size = detDesc[index].textContent.split(/[\s,]+/);
                        var seeds = tds[index].textContent;
                        var leechs = tdl[index].textContent;
                        $('tbody').append('<tr><td class="link"><a href=' + magnet[index] + '>' + title + '</a>' + '</a></td><td class="size">' + ' ' + size[4] + ' ' + size[5] + ' ' + '</span></td><td class="seeders">' + seeds + '</td><td class="leechers">' + leechs + '</td></tr>');

                    });
                    $("table").trigger("update");
                    sortTable();
                })
                .fail(function(textContent) {
                    console.log("error");
                    console.log(textContent);
                    // $('#enlaces').append('<p>thepiratebay ' + textContent.statusText+'</p>');
                    console.log("piratebay " + textContent.statusTex);
                })
                .always(function(xhr, status) {
                    console.log("complete");
                    console.log(status);
                });
        }
    }
    //torrent proyect
    function searchTP() {
        if (document.getElementById('TP').checked) {
            if ((document.getElementById('expert').checked)) {
                title = busqueda;
                year = "";
            }
            $.ajax({
                    url: 'ajaxproxy.php?https://torrentproject.se/?s=' + encodeURI(title) + '+' + year + '&filter=2000&hl=en&safe=on&num=20&start=0&orderby=best',
                    type: 'GET',
                    dataType: 'html',
                })
                .done(function(data) {
                    console.log("success");
                    if (!$(data).find('.torrent')) {
                        $('#enlaces').append('<p>No results found in TorrentProject</p>');
                        // exit();
                        return;
                    }
                    var torrent = $(data).find('.torrent');
                    var title = $(data).find('h3 a');
                    var seed = $(data).find('div span span b:even');
                    var leech = $(data).find('div span span b:odd');
                    var magnet = $(data).find('a.l.tl');
                    var size = $(data).find('span.bc.torrent-size');
                    var link;
                    $(data).find('h3 a').each(function(index, el) {
                        link = $(el).attr('href').split('/');
                        $('tbody').append('<tr><td class="link"><a href="magnet:?xt=urn:btih:' + link[1] + '&tr=udp://tracker.opentrackr.org:1337&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://9.rarbg.to:2710&tr=udp://tracker.leechers-paradise.org:6969/announce/">' + title[index].text + '</a></td><td class="size">' + ' ' + size[index].textContent + '</td><td class="seeders">' + ' ' + seed[index].textContent + '</td><td class="leechers">' + ' ' + leech[index].textContent + '</td></tr>');
                    });
                    $("table").trigger("update");
                    sortTable();
                })
                .fail(function() {
                    console.log("error");
                })
                .always(function() {
                    console.log("complete");
                });
        }
    }


    function searchTZ2() {
        if (document.getElementById('TZ2').checked) {
            if ((document.getElementById('expert').checked)) {
                title = busqueda;
                year = "";
            }
            $.ajax({
                    url: 'ajaxproxy.php?https://torrentz2.eu/search?f=' + title + ' ' + year + '+video',
                    type: 'GET',
                    dataType: 'html',
                })
                .done(function(data) {
                    console.log("success");
                    var dl = $(data).find('dl');
                    var dt = $(data).find('dt a');
                    var magnet = dt.attr('href');
                    var dd = $(data).find('dd');
                    var size = $(data).find('dd span:nth-child(3)'); //size
                    var seed = $(data).find('dd span:nth-child(4)'); //seed
                    var leech = $(data).find('dd span:nth-child(5)'); //leech
                    
                    
                    $(data).find('dt a').each(function(index, val) {
                        //quitar coma miles
                        var seed2=seed[index].textContent.replace(/\,/g,'');
                         var leech2=leech[index].textContent.replace(/\,/g,'');
                        /*console.log(dt[index].textContent); //title
                        console.log(dt.attr('href').replace(/\//g, "")); //enlace
                        console.log(size[index].textContent);
                        console.log(seed[index].textContent);
                        console.log(leech[index].textContent);*/
                        $('tbody').append('<tr><td class="link"><a href="magnet:?xt=urn:btih:' + $(val).attr('href').replace(/\//g, "") + '&tr=udp://tracker.opentrackr.org:1337&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://9.rarbg.to:2710&tr=udp://tracker.leechers-paradise.org:6969/announce/">' + dt[index].textContent + '</a></td><td class="size">' + ' ' + size[index].textContent + '</td><td class="seeders">' + ' ' + seed2 + '</td><td class="leechers">' + ' ' + leech2 + '</td></tr>');


                    });

                })
                .fail(function() {
                    console.log("error");
                })
                .always(function() {
                    console.log("complete");
                });
        }
    }
    //streaming instant
    function instant(magnet) {

        popupCenter('https://instant.io/#' + magnet, "test", 800, 600);
    }

    function popupCenter(url, title, w, h) {
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    }




    function consulta(origen) {
        console.log('consulta');

        if (origen === "iconRandom") {
            $('.contenedor').hide();
        }
        $('.landing').hide();
        $('.info').empty();
        $('.loader').show();
        $('#ui-id-1').hide();
        $('.ui-autocomplete-loading').removeClass('ui-autocomplete-loading');

        if (origen === "btnRandom" || origen === "iconRandom") {
            if (randomTitle !== "") {
                busqueda = randomTitle;
                randomTitle = "";
                getRandomMovie();
            } else if (randomTitle === "") {
                getRandomMovie();
                consulta();
                return;
            }
        } else {
            busqueda = $('#buscar').val();
        }

        //punto coma año
        //var a = 'ABCs.Of.Death.2.5.2016'; //separar por punto y espacio
        //var b = a.split(/\s|\./);
        if (!(document.getElementById('expert').checked)) {
            if (busqueda.replace(/^\D+/g, '').length === 4) {
                year = busqueda.replace(/^\D+/g, '');
                busqueda = busqueda.match(/^\D+/g);
            } else {
                year = "";
            }
        } else {
            year = "";
        }

        //busqueda yandex 
        jQuery(document).ready(function($) {
            $.ajax({
                    url: 'ajaxproxy.php?https://yandex.com/search/xml?user=kamikace&key=03.409040134:43ae31eeeefc88dbf9bde86ebe6ec5ec&sortby=rlv&l10n=en&query=site%3Aimdb.com+' + encodeURI(busqueda) + '+' + year,
                    type: 'GET',
                    dataType: 'xml',
                })
                .done(function(data) {
                    console.log("success");
                    console.log(data);
                    var dir = [];
                    $(data).find('url').each(function(data, index) {

                        dir.push($(this).text());
                    });
                    var a = dir[0].split('/');

                    //id imdb  console.log(a[4]); 
                    if (typeof a[4] === 'undefined') {
                        var b = dir[0].split('?'); //otro tipo url Title?0234215
                        imdb = 'tt' + b[1];
                    } else {
                        imdb = a[4];
                    }
                    //Extraer info actor/director
                    var asd = imdb.replace(/[0-9]/g, '');
                    var desc = [];
                    var name = [];
                    if (asd === 'nm') {
                        type = 'person';
                        console.log('bien');
                        $(data).find('passages').each(function(xml, index) {
                            console.log(this);
                            desc.push($(this).text());

                        });
                        $(data).find('title').each(function(xml, index) {
                            console.log(this);
                            name.push($(this).text());

                        });
                        console.log(desc[0]);
                        console.log(name[0]);
                        $('#titulo').append(name[0]);
                        $('#descripcion').append(desc[0]);
                        $.ajax({ //foto del actor
                                url: 'ajaxproxy.php?http://www.imdb.com/name/' + imdb + '/',
                                type: 'GET',
                                dataType: 'html',
                            })
                            .done(function(img) {
                                console.log("success");
                                $(img).find('#name-poster').clone().appendTo("#poster");
                            });

                    }

                    console.log(imdb);

                    //busqueda en omdbapi titulo y año
                    jQuery.ajax({
                            //url: 'proxy.php?url=http://www.imdb.com/xml/find?json=1&nr=1&tt=on&q=matrix',
                            url: 'https://www.omdbapi.com/?i=' + imdb + '&r=json',
                            type: 'GET',
                            dataType: 'json',

                        })
                        .done(function(json) {
                            console.log("success");
                            setTimeout(function() { //temporizador
                                if ($('.landing').css('display') === 'block') {
                                    return;
                                } else {
                                    exit();
                                }


                            }, 5000);

                            if (json.Response === 'False' || json.Type === 'game') {
                                if (document.getElementById('expert').checked) {
                                    $('#enlaces').append('<table class="tablesorter"><thead><tr><th>Links</th><th>Size</th><th title="Seeders">Seed</th><th title="Leechers">Leech</th></tr></thead><tbody></tbody></table>');
                                    searchRarbg();
                                    searchTpb();
                                    searchTP();
                                    searchTZ2();
                                    //final ajax limpiar y ordenar tabla
                                    $(document).ajaxStop(function() {
                                        sortTable();
                                        $('table').stacktable();
                                        exit();
                                        $(this).unbind("ajaxStop");

                                    });
                                }
                                if (type != 'person') {
                                    $('#titulo').append('<p>No results found</p>');

                                }
                                exit();
                                return;
                            }

                            imdb = json.imdbID;
                            title = json.Title;
                            year = json.Year;
                            type = json.Type;
                            var writer = json.Writer;
                            if (writer.length > 91) {
                                writer = writer.slice(0, 90) + "...";
                            }
                            var actors = json.Actors;
                            if (actors.length > 91) {
                                actors = actors.slice(0, 90) + "...";
                            }
                            var director = json.Director;
                            if (director.length > 91) {
                                director = director.slice(0, 90) + "...";
                            }
                            var plot = json.Plot;
                            if (plot.length > 270) {
                                plot = plot.slice(0, 270) + "...";
                            }
                            var title2 = json.Title;
                            if (title2.length > 45) {
                                title2 = title2.slice(0, 45) + "...";
                            }
                            $('#titulo').append('<h2 title="' + title + '">' + title2 + ' ' + '(' + year + ')' + '</h2>');
                            $('#nota').append('<span class="imdbRatingPlugin imdbRatingStyle1" data-user="ur64023610" data-title="tt0591328" data-style="p1"><a target="_blank" href="http://www.imdb.com/title/' + imdb + '/?ref_=plg_rt_1"><img src="http://g-ecx.images-amazon.com/images/G/01/imdb/plugins/rating/images/imdb_46x22.png"></a><span class="rating">' + json.imdbRating + '<span class="ofTen">/10</span></span><img src="http://g-ecx.images-amazon.com/images/G/01/imdb/plugins/rating/images/imdb_star_22x21.png" class="star"></span>');


                            $('#descripcion').append('<p>' + json.Runtime + '</p>');
                            $('#descripcion').append('<p>' + json.Genre + '</p>');
                            $('#descripcion').append('<p>' + director + '</p>');
                            $('#descripcion').append('<p>' + writer + '</p>');
                            $('#descripcion').append('<p>' + actors + '</p>');

                            $('#descripcion').append('<p>' + plot + '</p>');
                            var video = title + " " + year;

                            var id = imdb.replace(/[^0-9\.]+/g, "");
                            $('#descripcion').append('<a target="_blank" href="http://www.opensubtitles.org/en/search/sublanguageid-eng/imdbid-' + id + '/sort-7/asc-0"><i class="fa fa-file-text-o fa-fw fa-2x" aria-hidden="true"></i><span>Subtitles</span></a>');
                            trailer(video);

                            //imdbNota();
                            //poster
                            jQuery.ajax({
                                    //url: 'https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=' + titulo,
                                    url: 'https://api.themoviedb.org/3/find/' + imdb + '?external_source=imdb_id&api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb',
                                    type: 'GET',
                                    dataType: 'json',
                                })
                                .done(function(json) {
                                    console.log("success");
                                    if (type === 'movie') {
                                        if (json.movie_results[0].poster_path === null) {
                                            $('#poster').append('No poster found');
                                            // exit();
                                            // return;
                                        }
                                        else{
                                            $('#poster').append('<img alt="poster" src="http://image.tmdb.org/t/p/w500' + json.movie_results[0].poster_path + '"\>');

                                        }
                                    } else if (type === 'series') {
                                        if (json.tv_results[0].poster_path === null) {
                                            $('#poster').append('No poster found');
                                            // exit();
                                            // return;
                                        }
                                        $('#poster').append('<img alt="poster" src="http://image.tmdb.org/t/p/w500' + json.tv_results[0].poster_path + '"\>');
                                    } else {
                                        $('#poster').append('No poster found');

                                    }

                                })
                                .fail(function() {
                                    console.log("error");
                                })
                                .always(function() {
                                    console.log("complete");
                                });
                            //magnet
                            //eleccion de servidor
                            $('#enlaces').append('<table class="tablesorter"><thead><tr><th>Links</th><th>Size</th><th title="Seeders">Seed</th><th title="Leechers">Leech</th></tr></thead><tbody></tbody></table>');
                            searchRarbg();
                            searchTpb();
                            searchTP();
                            searchTZ2();
                            //final ajax limpiar y ordenar tabla
                            $(document).ajaxStop(function() {
                                sortTable();
                                $('table').stacktable();
                                exit();
                                $(this).unbind("ajaxStop");
                            });

                        })
                        .fail(function() {
                            console.log("error");
                        })
                        .always(function(json) {
                            console.log("complete");

                        });

                })
                .fail(function() {
                    console.log("error");
                })
                .always(function() {
                    console.log("complete");


                });
        });
    }
    //chorrada invaders
    /*  var contador = 0;
      $('.logo').click(function(event) {
          $('.invader').toggle();
          $('.contador').toggle();

      });
      animateDiv();
      $('.invader').hover(function() {
          animateDiv();
      });
      $('.invader').click(function(event) {
          contador++;
          $('.contador').html(contador);
      });

      function makeNewPosition() {
          // Get viewport dimensions (remove the dimension of the div)
          var h = $(window).height() - 50;
          var w = $(window).width() - 50;
          var nh = Math.floor(Math.random() * h);
          var nw = Math.floor(Math.random() * w);
          return [nh, nw];
      }

      function animateDiv() {
          var newq = makeNewPosition();
          $('.invader').animate({ top: newq[0], left: newq[1] });
      }*/
});
